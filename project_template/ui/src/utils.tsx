// export const IS_FAKE = false;

export const PUBLISHER = "template.os";
export const PUBLISHER_DASH = PUBLISHER.replace(".","-");
export const APP_SLUG = "%APPSLUG%";
export const PACKAGE_SUBDOMAIN = `${APP_SLUG}-${PUBLISHER_DASH}`;
export const PROCESS_NAME = `${APP_SLUG}:${APP_SLUG}:${PUBLISHER}`;
export const BASE_URL = `/${PROCESS_NAME}`;


if (window.our) window.our.process = BASE_URL?.replace("/", "");

export const PROXY_TARGET = `${(import.meta.env.VITE_NODE_URL || `http://${PACKAGE_SUBDOMAIN}.localhost:${8080}`)}${BASE_URL}`;

// This env also has BASE_URL which should match the process + package name
export const WEBSOCKET_URL = import.meta.env.DEV
  ? `${PROXY_TARGET.replace('http', 'ws')}`
  : undefined;
