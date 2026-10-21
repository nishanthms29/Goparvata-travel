<?php

function jsonResponse(bool $success, string $message, array $data = [], int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
    exit;
}

function jsonOk(string $message, array $data = []): void {
    jsonResponse(true, $message, $data);
}

function jsonError(string $message, int $code = 400): void {
    jsonResponse(false, $message, [], $code);
}

function jsonBody(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}
