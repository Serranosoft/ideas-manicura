#!/usr/bin/env node
/**
 * prepare-eas-dependencies.js
 *
 * Hook EAS pre-install para la app "Ideas y diseño de uñas" (nails-designs).
 * Se ejecuta automáticamente mediante el hook "eas-build-pre-install" definido
 * en package.json, ANTES de que EAS instale dependencias y antes de Expo Prebuild.
 *
 * Propósito:
 *   Eliminar expo-dev-client y sus dependencias nativas del package.json y del
 *   package-lock.json temporales del workspace de EAS cuando el perfil de build
 *   no es "development". Esto evita que Expo Autolinking incluya Jetpack Compose,
 *   ML Kit Barcode Scanner, Navigation Compose, Apollo y Google Code Scanner en
 *   el AAB de producción/preview, reduciendo aproximadamente 11 MB.
 *
 * IMPORTANTE: Este script NO debe ejecutarse manualmente sobre el repositorio.
 *   EAS lo ejecuta sobre su copia temporal; el package.json y package-lock.json
 *   reales del repositorio jamás se ven modificados.
 *
 * Variables de entorno relevantes:
 *   EAS_BUILD_PROFILE              — Definida por EAS (ej. "production", "preview", "development")
 *   NAILS_EXCLUDE_EXPO_DEV_CLIENT  — "true" para excluir, "false" para conservar
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Paquetes que se eliminarán del lockfile (node_modules/<nombre>) */
const LOCKFILE_PACKAGES_TO_REMOVE = [
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
  'expo-json-utils',
  'expo-manifests',
  'expo-updates-interface',
];

const PACKAGE_JSON_PATH   = path.resolve(__dirname, '..', 'package.json');
const LOCK_JSON_PATH      = path.resolve(__dirname, '..', 'package-lock.json');

// ─── Helpers de log ──────────────────────────────────────────────────────────

function log(msg)  { console.log(`[prepare-eas-deps] ${msg}`); }
function warn(msg) { console.warn(`[prepare-eas-deps] ⚠️  ${msg}`); }
function ok(msg)   { console.log(`[prepare-eas-deps] ✅ ${msg}`); }

// ─── Lógica principal ─────────────────────────────────────────────────────────

function main() {
  const easProfile = process.env.EAS_BUILD_PROFILE;
  const excludeVar = process.env.NAILS_EXCLUDE_EXPO_DEV_CLIENT;

  log(`EAS_BUILD_PROFILE              = ${easProfile ?? '(no definido)'}`);
  log(`NAILS_EXCLUDE_EXPO_DEV_CLIENT  = ${excludeVar ?? '(no definido)'}`);

  // Seguridad: si no se detecta entorno EAS, abortar sin modificar nada.
  if (!easProfile) {
    warn('EAS_BUILD_PROFILE no está definido.');
    warn('Este script solo debe ejecutarse en el entorno EAS. Abortando sin cambios.');
    process.exit(0);
  }

  // Determinar si hay que excluir.
  // Regla: excluir en cualquier perfil que NO sea "development",
  //        o cuando NAILS_EXCLUDE_EXPO_DEV_CLIENT === "true" explícitamente.
  // Conservar solo cuando el perfil sea "development" Y la variable no fuerce exclusión.
  const isDevProfile      = easProfile === 'development';
  const forceExclude      = excludeVar === 'true';
  const forceInclude      = excludeVar === 'false';
  const shouldExclude     = forceExclude || (!isDevProfile && !forceInclude);

  if (!shouldExclude) {
    ok(`Perfil "${easProfile}" — expo-dev-client CONSERVADO (build de desarrollo).`);
    process.exit(0);
  }

  log(`Perfil "${easProfile}" — eliminando expo-dev-client y dependencias nativas…`);

  // ── 1. Modificar package.json ────────────────────────────────────────────
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    warn(`No se encontró package.json en: ${PACKAGE_JSON_PATH}`);
  } else {
    const pkgRaw  = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    const pkg     = JSON.parse(pkgRaw);
    let   removed = false;

    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      if (pkg[section] && pkg[section]['expo-dev-client'] !== undefined) {
        delete pkg[section]['expo-dev-client'];
        log(`  package.json → eliminado de "${section}"`);
        removed = true;
      }
    }

    if (!removed) {
      log('  package.json → expo-dev-client no estaba presente (nada que eliminar)');
    }

    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    ok('package.json actualizado.');
  }

  // ── 2. Modificar package-lock.json ──────────────────────────────────────
  if (!fs.existsSync(LOCK_JSON_PATH)) {
    warn(`No se encontró package-lock.json en: ${LOCK_JSON_PATH}`);
  } else {
    const lockRaw = fs.readFileSync(LOCK_JSON_PATH, 'utf8');
    const lock    = JSON.parse(lockRaw);
    let   changed = false;

    // 2a. Entrada raíz: packages[""].dependencies
    const rootEntry = lock.packages && lock.packages[''];
    if (rootEntry) {
      for (const section of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        if (rootEntry[section] && rootEntry[section]['expo-dev-client'] !== undefined) {
          delete rootEntry[section]['expo-dev-client'];
          log(`  package-lock.json → eliminado de packages[""].${section}`);
          changed = true;
        }
      }
    }

    // 2b. Entradas node_modules/<paquete>
    for (const pkgName of LOCKFILE_PACKAGES_TO_REMOVE) {
      const key = `node_modules/${pkgName}`;
      if (lock.packages && lock.packages[key] !== undefined) {
        delete lock.packages[key];
        log(`  package-lock.json → eliminado "${key}"`);
        changed = true;
      } else {
        log(`  package-lock.json → "${key}" no encontrado (ya ausente o no instalado)`);
      }
    }

    if (!changed) {
      log('  package-lock.json → ningún cambio necesario');
    }

    fs.writeFileSync(LOCK_JSON_PATH, JSON.stringify(lock, null, 2) + '\n', 'utf8');
    ok('package-lock.json actualizado.');
  }

  ok(`Optimización completada para el perfil "${easProfile}". expo-dev-client excluido del build.`);
}

main();
