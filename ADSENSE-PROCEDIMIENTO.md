# Google AdSense: preparado, desactivado

Estado (2026-10-15): **todo el código está montado pero apagado**. Con `ADS.activo = false` en
`src/config/ads.mjs` el sitio no carga nada de Google, la CSP no cambia, no hay huecos y
`/ads.txt` solo lleva un comentario. Si algo de aquí choca con `CLAUDE.md`, manda `CLAUDE.md`.

## Qué hay preparado

| Pieza | Para qué |
|---|---|
| `src/config/ads.mjs` | Interruptor (`activo`), identificador de editor y de bloques. Único sitio que hay que tocar para encender. |
| `src/components/AdSlot.astro` | Hueco publicitario con etiqueta "Publicidad" y altura reservada (sin salto de maquetación). No pinta nada si está apagado. Aún no está colocado en ninguna página. |
| `src/layouts/BaseLayout.astro` | Carga `adsbygoogle.js` solo si `adsListos()`. |
| `astro.config.mjs` | Añade a la CSP los orígenes de Google solo si `adsListos()`. |
| `src/pages/ads.txt.ts` | Genera `/ads.txt` con la línea de AdSense cuando hay identificador. |

Comprobado el 2026-10-15: con el interruptor en false el HTML y la CSP son idénticos a los de antes;
con un identificador de prueba aparecen el script, los orígenes de CSP y la línea de `ads.txt`.

## Cuándo pedirlo (decisión de David, 2026-10-15)

No antes de que se cumplan **todas**:

1. Search Console muestra **40 o más páginas indexadas** y clics orgánicos diarios (no hace falta mucho
   tráfico, pero sí señal de que Google ya trata el sitio como real). Previsto: 4 a 6 semanas.
2. El aviso legal ya lleva una **dirección** (art. 10 LSSI-CE). Pendiente de David.
3. `cookies.astro` y `privacidad.astro` actualizadas (ver textos más abajo).
4. El **banner de consentimiento** funciona (paso 3).

## Orden de activación

### Lo que hace David (cuentas y trámites)

1. Crear la cuenta de **Google AdSense** con el email del proyecto y añadir `wealthuncut.com`. Rellenar los datos
   fiscales y de cobro (solo él puede).
2. AdSense le da un fragmento de verificación y un identificador `ca-pub-XXXXXXXXXXXXXXXX`. Pasarlo a Claude.
3. En AdSense, abrir **Privacidad y mensajes** y crear el mensaje de consentimiento del EEE (Funding Choices,
   gratuito y certificado para el EEE). Publicarlo en el dominio.
4. Esperar la revisión (de unos días a un par de semanas). No tocar nada del sitio mientras tanto.

### Lo que hace Claude cuando David pasa el identificador

1. Poner `publisherId` en `src/config/ads.mjs` y `activo: true` **en una rama aparte**, no directamente en `main`.
2. Revisar la CSP (ver abajo), `npm run build` y probar en local con el navegador: consola sin errores de CSP,
   banner de consentimiento visible, ningún anuncio sin consentimiento.
3. Colocar `AdSlot` solo en páginas con tráfico (artículos y herramientas con más visitas). Nunca encima del pliegue,
   nunca dentro de la calculadora, nunca más de uno o dos por página.
4. Actualizar `cookies.astro` y `privacidad.astro` en el mismo commit que activa los anuncios.
5. Subir a `main`, comprobar producción (cabeceras, Lighthouse: CLS debe seguir en 0 o cercano) y avisar a David.

## CSP: lo que hay que validar antes de encender

La CSP actual es estricta (sin `'unsafe-inline'`). AdSense inyecta scripts en línea y puede usar `eval`, así que
**puede romperse el anuncio aunque estén permitidos los orígenes**. Opciones, de más a menos segura:

1. Probar tal cual (lo que deja preparado `astro.config.mjs`) y mirar la consola.
2. Si falla, abrir solo lo mínimo en las páginas que llevan anuncios (Astro permite CSP por página), no en todo el sitio.
3. Último recurso: `'unsafe-inline'` en `script-src` solo para esas páginas. Es una pérdida de seguridad real:
   decidirlo con David y anotarlo en `CLAUDE.md`.

El banner de consentimiento (Funding Choices) también carga desde `fundingchoicesmessages.google.com`,
ya incluido en los orígenes preparados.

## Textos a publicar (borrador, solo cuando se active)

**`cookies.astro`:** sustituir "ninguna cookie" por: el sitio usa cookies de Google AdSense y de su banner de
consentimiento para mostrar publicidad y recordar tu elección; solo se instalan si las aceptas; puedes cambiar
tu decisión desde el enlace "Gestionar consentimiento" del pie; enlace a la política de Google
(`policies.google.com/technologies/ads`).

**`privacidad.astro`:** añadir Google Ireland Ltd. como proveedor de publicidad y corresponsable del tratamiento
de datos publicitarios, base legal consentimiento (art. 6.1.a RGPD), conservación según Google, transferencias
internacionales con cláusulas contractuales tipo, y cómo retirar el consentimiento.

**Footer:** enlace "Gestionar consentimiento" que reabra el mensaje de Funding Choices (lo ofrece el propio mensaje).

## Cosas que NO hacer

- No activar AdSense sin el banner funcionando: sería un incumplimiento del RGPD y de la LSSI.
- No colocar anuncios en `/herramientas/*` dentro del propio formulario ni cerca de botones (clics accidentales).
- No pedir a nadie que haga clic en los anuncios ni hacerlo uno mismo: suspende la cuenta.
- No poner anuncios en las páginas legales ni en las de plantillas descargables.
- No publicar enlaces de afiliado y anuncios en el mismo bloque.

## Si rechazan la solicitud

Es habitual en sitios nuevos ("contenido de poco valor" o "sitio no listo"). No se cambia nada a ciegas:
leer el motivo, esperar 2 a 4 semanas con más páginas indexadas y volver a pedirlo. Revertir es solo
`activo: false`.
