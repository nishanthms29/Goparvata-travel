<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/brand.php';
require_once __DIR__ . '/../includes/response.php';

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Strict',
    ]);
    session_start();
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'admin_status') {
        $authenticated = !empty($_SESSION['travel_admin_authenticated']);
        if ($authenticated && empty($_SESSION['travel_csrf_token'])) {
            $_SESSION['travel_csrf_token'] = bin2hex(random_bytes(32));
        }
        jsonOk('Travel admin status loaded.', [
            'authenticated' => $authenticated,
            'csrf_token' => $authenticated ? $_SESSION['travel_csrf_token'] : '',
        ]);
    }

    if ($action === 'public') {
        $db = getDB();
        $destinations = $db->query(
            'SELECT id, name, category, description, price_label, gradient_start, gradient_end
             FROM travel_destinations WHERE is_active = 1 ORDER BY sort_order, id'
        )->fetchAll();
        $settings = $db->query('SELECT setting_key, setting_value FROM travel_settings')->fetchAll();
        $settingsByKey = [];
        foreach ($settings as $setting) {
            $settingsByKey[$setting['setting_key']] = $setting['setting_value'];
        }
        jsonOk('Travel content loaded.', [
            'destinations' => $destinations,
            'settings' => $settingsByKey,
        ]);
    }

    requireTravelAdmin();
    $db = getDB();
    switch ($action) {
        case 'enquiries':
            $rows = $db->query(
                'SELECT id, destination_name, full_name, email, travellers, notes, status, created_at
                 FROM travel_enquiries ORDER BY created_at DESC LIMIT 500'
            )->fetchAll();
            jsonOk('Travel enquiries loaded.', ['enquiries' => $rows]);

        case 'destinations':
            $rows = $db->query(
                'SELECT id, name, category, description, price_label, gradient_start, gradient_end,
                        is_active, sort_order
                 FROM travel_destinations ORDER BY sort_order, id'
            )->fetchAll();
            jsonOk('Destinations loaded.', ['destinations' => $rows]);

        case 'settings':
            $rows = $db->query('SELECT setting_key, setting_value FROM travel_settings')->fetchAll();
            $settingsByKey = [];
            foreach ($rows as $setting) {
                $settingsByKey[$setting['setting_key']] = $setting['setting_value'];
            }
            jsonOk('Website settings loaded.', ['settings' => $settingsByKey]);

        default:
            jsonError('Unknown travel action.', 400);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$body = jsonBody();
if ($action === 'admin_login') {
    loginTravelAdmin($body);
}
if ($action === 'admin_logout') {
    requireTravelCsrf();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    jsonOk('You have been logged out.');
}
if ($action === 'submit') {
    $db = getDB();
    submitTravelEnquiry($db, $body);
}

requireTravelAdmin();
requireTravelCsrf();
$db = getDB();

switch ($action) {
    case 'update_status':
        $id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT);
        $status = $body['status'] ?? '';
        if (!$id || !in_array($status, ['new', 'contacted', 'closed'], true)) {
            jsonError('Choose a valid enquiry and status.');
        }
        $stmt = $db->prepare('UPDATE travel_enquiries SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        if (!$stmt->rowCount()) {
            $check = $db->prepare('SELECT id FROM travel_enquiries WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                jsonError('Travel enquiry not found.', 404);
            }
        }
        jsonOk('Enquiry status updated.');

    case 'save_destination':
        saveTravelDestination($db, $body);

    case 'delete_destination':
        $id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id) {
            jsonError('Choose a valid destination.');
        }
        $stmt = $db->prepare('DELETE FROM travel_destinations WHERE id = ?');
        $stmt->execute([$id]);
        if (!$stmt->rowCount()) {
            jsonError('Destination not found.', 404);
        }
        jsonOk('Destination deleted.');

    case 'save_settings':
        saveTravelSettings($db, $body);

    default:
        jsonError('Unknown travel action.', 400);
}

function loginTravelAdmin(array $body): void {
    $adminEmail = getenv('TRAVEL_ADMIN_EMAIL') ?: '';
    $passwordHash = getenv('TRAVEL_ADMIN_PASSWORD_HASH') ?: '';
    if (!filter_var($adminEmail, FILTER_VALIDATE_EMAIL) || !password_get_info($passwordHash)['algo']) {
        error_log('Travel admin login is unavailable: configure TRAVEL_ADMIN_EMAIL and TRAVEL_ADMIN_PASSWORD_HASH.');
        jsonError('Travel admin login is not configured on this server.', 503);
    }

    $email = strtolower(travelInputString($body, 'email'));
    $password = is_string($body['password'] ?? null) ? $body['password'] : '';
    if (!hash_equals(strtolower($adminEmail), $email) || !password_verify($password, $passwordHash)) {
        jsonError('Invalid email or password.', 401);
    }

    session_regenerate_id(true);
    $_SESSION['travel_admin_authenticated'] = true;
    $_SESSION['travel_csrf_token'] = bin2hex(random_bytes(32));
    jsonOk('Signed in successfully.', ['csrf_token' => $_SESSION['travel_csrf_token']]);
}

function requireTravelAdmin(): void {
    if (empty($_SESSION['travel_admin_authenticated'])) {
        jsonError('Please sign in to continue.', 401);
    }
}

function requireTravelCsrf(): void {
    $sessionToken = $_SESSION['travel_csrf_token'] ?? '';
    $requestToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sessionToken) || $sessionToken === '' || !hash_equals($sessionToken, $requestToken)) {
        jsonError('Your admin session has expired. Sign in again and try once more.', 403);
    }
}

function submitTravelEnquiry(PDO $db, array $body): void {
    if (travelInputString($body, 'website') !== '') {
        jsonOk('Thank you. Your request has been received.');
    }

    $name = travelInputString($body, 'name');
    $email = travelInputString($body, 'email');
    $destination = travelInputString($body, 'destination');
    $travellers = filter_var($body['travellers'] ?? null, FILTER_VALIDATE_INT);
    $notes = travelInputString($body, 'notes');

    if ($name === '' || travelTextLength($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL) || travelTextLength($email) > 190) {
        jsonError('Enter a valid name and email address.');
    }
    if (!$travellers || $travellers < 1 || $travellers > 20) {
        jsonError('Choose between 1 and 20 travellers.');
    }
    if (travelTextLength($notes) > 2000) {
        jsonError('Your notes must be 2,000 characters or fewer.');
    }

    $destinationId = null;
    if ($destination === 'unsure') {
        $destinationName = 'Not sure yet';
    } else {
        $destinationId = filter_var($destination, FILTER_VALIDATE_INT);
        if (!$destinationId) {
            jsonError('Choose a listed destination or “Not sure yet”.');
        }
        $destinationQuery = $db->prepare(
            'SELECT name FROM travel_destinations WHERE id = ? AND is_active = 1'
        );
        $destinationQuery->execute([$destinationId]);
        $destinationName = $destinationQuery->fetchColumn();
        if (!$destinationName) {
            jsonError('That destination is no longer available. Please choose another.');
        }
    }

    $stmt = $db->prepare(
        'INSERT INTO travel_enquiries (destination_id, destination_name, full_name, email, travellers, notes)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$destinationId, $destinationName, $name, $email, $travellers, $notes]);
    $enquiryId = (int)$db->lastInsertId();
    $mailSent = sendTravelNotification($enquiryId, $name, $email, $destinationName, $travellers, $notes);

    $message = 'Your request has been received. A travel planner will be in touch.';
    if (!$mailSent) {
        $message .= ' The request is saved, but the email alert could not be sent. Please contact the travel team directly if it is urgent.';
    }
    jsonOk($message, ['enquiry_id' => $enquiryId, 'email_sent' => $mailSent]);
}

function sendTravelNotification(
    int $enquiryId,
    string $name,
    string $email,
    string $destination,
    int $travellers,
    string $notes
): bool {
    $recipient = getenv('TRAVEL_ADMIN_EMAIL') ?: '';
    $sender = getenv('TRAVEL_FROM_EMAIL') ?: '';
    $smtpPassword = getenv('TRAVEL_SMTP_PASSWORD') ?: '';
    if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)
        || !filter_var($sender, FILTER_VALIDATE_EMAIL)
        || $smtpPassword === ''
    ) {
        error_log('Travel enquiry notification skipped: configure the Gmail SMTP sender, recipient, and app password.');
        return false;
    }

    $autoload = __DIR__ . '/../../vendor/autoload.php';
    if (!is_file($autoload)) {
        error_log('Travel enquiry notification failed: PHPMailer dependencies are not installed.');
        return false;
    }

    require_once $autoload;
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = getenv('TRAVEL_SMTP_HOST') ?: 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $sender;
        $mail->Password = $smtpPassword;
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->Timeout = 20;
        $mail->CharSet = \PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
        $mail->setFrom($sender, travelBrand()['name']);
        $mail->addAddress($recipient);
        $mail->addReplyTo($email, $name);
        $brandName = travelBrand()['name'];
        $mail->Subject = 'New ' . $brandName . ' travel enquiry #' . $enquiryId;
        $mail->Body = "New {$brandName} travel enquiry #{$enquiryId}\n\n"
            . "Name: {$name}\nEmail: {$email}\nDestination: {$destination}\n"
            . "Travellers: {$travellers}\nNotes: {$notes}\n";
        $mail->send();
        return true;
    } catch (\PHPMailer\PHPMailer\Exception $error) {
        error_log('Travel enquiry email delivery failed for enquiry #' . $enquiryId . ': ' . $error->getMessage());
        return false;
    }
}

function saveTravelDestination(PDO $db, array $body): void {
    $id = filter_var($body['id'] ?? 0, FILTER_VALIDATE_INT);
    $name = travelInputString($body, 'name');
    $category = travelInputString($body, 'category');
    $description = travelInputString($body, 'description');
    $price = travelInputString($body, 'price_label');
    $start = travelInputString($body, 'gradient_start');
    $end = travelInputString($body, 'gradient_end');
    $active = filter_var($body['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $order = filter_var($body['sort_order'] ?? 0, FILTER_VALIDATE_INT);
    $categories = ['beach', 'mountain', 'culture', 'city'];

    if ($id === false || $name === '' || travelTextLength($name) > 100
        || !in_array($category, $categories, true)
        || $description === '' || travelTextLength($description) > 255
        || $price === '' || travelTextLength($price) > 80
        || !preg_match('/^#[0-9a-fA-F]{6}$/', $start)
        || !preg_match('/^#[0-9a-fA-F]{6}$/', $end)
        || $order === false || $order < 0 || $order > 10000
    ) {
        jsonError('Check the destination fields and try again.');
    }

    if ((int)$id > 0) {
        $stmt = $db->prepare(
            'UPDATE travel_destinations
             SET name = ?, category = ?, description = ?, price_label = ?,
                 gradient_start = ?, gradient_end = ?, is_active = ?, sort_order = ?
             WHERE id = ?'
        );
        try {
            $stmt->execute([$name, $category, $description, $price, $start, $end, (int)$active, $order, $id]);
        } catch (PDOException $error) {
            if (($error->errorInfo[0] ?? '') === '23000') {
                jsonError('A destination with that name already exists.', 409);
            }
            throw $error;
        }
        if (!$stmt->rowCount()) {
            $check = $db->prepare('SELECT id FROM travel_destinations WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                jsonError('Destination not found.', 404);
            }
        }
        jsonOk('Destination saved.');
    }

    $stmt = $db->prepare(
        'INSERT INTO travel_destinations
         (name, category, description, price_label, gradient_start, gradient_end, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    try {
        $stmt->execute([$name, $category, $description, $price, $start, $end, (int)$active, $order]);
    } catch (PDOException $error) {
        if (($error->errorInfo[0] ?? '') === '23000') {
            jsonError('A destination with that name already exists.', 409);
        }
        throw $error;
    }
    jsonOk('Destination added.', ['id' => (int)$db->lastInsertId()]);
}

function saveTravelSettings(PDO $db, array $body): void {
    $limits = [
        'hero_title' => 240,
        'hero_intro' => 500,
        'destinations_title' => 160,
        'destinations_intro' => 500,
        'why_title' => 160,
        'why_intro' => 500,
        'benefit_one_title' => 120,
        'benefit_one_copy' => 300,
        'benefit_two_title' => 120,
        'benefit_two_copy' => 300,
        'benefit_three_title' => 120,
        'benefit_three_copy' => 300,
        'plan_title' => 160,
        'plan_intro' => 500,
        'contact_email' => 190,
        'contact_phone' => 40,
    ];
    $values = [];
    foreach ($limits as $key => $maxLength) {
        $value = travelInputString($body, $key);
        if ($value === '' || travelTextLength($value) > $maxLength) {
            jsonError('Website text fields cannot be empty and must stay within their character limits.');
        }
        if ($key === 'contact_email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            jsonError('Enter a valid contact email address.');
        }
        $values[$key] = $value;
    }

    $stmt = $db->prepare(
        'INSERT INTO travel_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
    );
    $db->beginTransaction();
    foreach ($values as $key => $value) {
        $stmt->execute([$key, $value]);
    }
    $db->commit();
    jsonOk('Website settings saved.');
}

function travelTextLength(string $value): int {
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function travelInputString(array $input, string $key): string {
    $value = $input[$key] ?? '';
    return is_string($value) || is_numeric($value) ? trim((string)$value) : '';
}
