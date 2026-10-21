<?php

function travelBrand(): array
{
    static $brand = null;
    if ($brand !== null) {
        return $brand;
    }

    $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'brand.config.json';
    $json = file_get_contents($path);
    if ($json === false) {
        throw new RuntimeException('The shared travel brand configuration could not be read.');
    }

    $config = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($config) || !is_string($config['name'] ?? null) || !is_string($config['tagline'] ?? null)) {
        throw new RuntimeException('The shared travel brand configuration is invalid.');
    }

    $brand = $config;
    return $brand;
}
