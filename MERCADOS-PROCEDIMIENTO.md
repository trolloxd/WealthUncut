# Procedimiento de la edición diaria de /mercados/

Este documento es la guía que sigue el agente automático que escribe cada mañana el artículo de
mercados. Si algo de aquí choca con `CLAUDE.md`, manda `CLAUDE.md`.

Decisión de David (2026-09-24): publicación diaria automática sin revisión humana previa, asumiendo
el riesgo de penalización de Google por contenido automatizado. Condición: **cero errores**. Por
eso la regla de oro es: **si un dato no se puede verificar en dos fuentes fiables independientes,
no se publica**, y si el artículo no se puede escribir con garantías, no se publica ese día.

## 1. Objetivo del artículo

Explicar a un lector joven en España, sin jerga, **qué ha pasado en los mercados, por qué ha pasado
y a qué le afecta a él** (ahorros, hipoteca y euríbor, fondos indexados, precios, empleo). No
repetir titulares: lo que aporta la edición es el porqué y la conexión con su bolsillo.

No es asesoramiento: nunca decir qué comprar, vender o cuándo. Nada de predicciones presentadas
como hechos ("el IBEX subirá"); como mucho, qué están esperando los analistas y citando a quién.

## 2. Pasos, en este orden

1. **Comprobar que no existe ya** `src/content/mercados/AAAA-MM-DD.mdx` para la fecha de hoy
   (Europe/Madrid). Si existe, terminar sin hacer nada.
2. **Datos oficiales**: `node scripts/datos-mercados.mjs AAAA-MM-DD`. Genera
   `src/data/mercados/AAAA-MM-DD.json` con las series del BCE. Si falla del todo, se puede
   escribir el artículo sin la tabla ni las gráficas, pero nunca inventando esos datos.
3. **Investigar** qué pasó desde la edición anterior (en lunes, desde el viernes):
   - Cierres y movimientos: IBEX 35, Euro Stoxx 50, S&P 500, Nasdaq, petróleo Brent, oro, bitcoin
     si ha sido noticia, euro/dólar.
   - Bancos centrales (BCE, Reserva Federal, Banco de Inglaterra, Banco de Japón): decisiones,
     actas, discursos relevantes.
   - Datos macro publicados (inflación, empleo, PIB, PMI), sobre todo de España, zona euro y
     EE. UU.
   - Noticias de empresas que hayan movido el mercado, geopolítica con impacto económico.
   - Agenda de hoy: qué datos o eventos se esperan.
4. **Elegir 2 o 3 temas** que de verdad importan. Mejor explicar bien tres cosas que mencionar
   diez.
5. **Verificar** (sección 3). Todo número que aparezca en el texto tiene que estar verificado.
6. **Redactar** siguiendo la estructura (sección 4) y el estilo (sección 5).
7. **Revisar el borrador completo como si fueras otra persona**: repasar cada cifra contra sus
   fuentes, cada fecha, cada nombre propio, cada porcentaje (¿sube o baja?, ¿puntos o por
   ciento?). Buscar afirmaciones que suenen a consejo o a predicción. Buscar guiones largos.
8. **Comprobar** que compila: `npm run build` sin errores y que la página
   `dist/client/mercados/AAAA-MM-DD/index.html` existe.
9. **Publicar**: commit con el mensaje `Mercados: edición del AAAA-MM-DD` y push a `main`.
   Cloudflare despliega solo. Antes de hacer push, `git pull --rebase` por si hay commits nuevos.
10. **Si no se ha podido verificar lo suficiente** para un artículo fiable, no publicar y terminar
    explicando por qué en el resumen de la sesión. Un día sin edición es mejor que un error.

## 3. Verificación de datos

- **Cada cifra de mercado** (cierre, variación, precio) se comprueba en **al menos dos fuentes
  independientes** de la lista. Si difieren, usar la fuente primaria (el propio mercado, el banco
  central, el organismo estadístico) o no dar la cifra exacta ("subió algo más de un 1%").
- **Datos macro**: siempre de la fuente oficial (INE, Eurostat, BCE, Banco de España, BLS, BEA,
  Reserva Federal). El artículo enlaza a esa fuente en `sources`.
- **Citas y declaraciones**: solo si aparecen en la fuente original o en dos medios fiables. Nunca
  poner entre comillas algo parafraseado.
- **Fechas**: cuidado con la diferencia horaria. El cierre de Wall Street del miércoles se conoce
  en España la madrugada del jueves.
- **Nada de rumores**, ni noticias de una sola fuente sin confirmar.
- Los datos del JSON del BCE son la referencia para tipos de cambio, tipo de depósito, €STR y
  rentabilidades de la deuda: si el texto da uno de esos datos, tiene que coincidir con el JSON.

Fuentes válidas para contrastar: Reuters, Bloomberg, Financial Times, The Wall Street Journal, CNBC,
Associated Press, Expansión, Cinco Días, El Economista, El Confidencial (sección de mercados), la
web de BME (Bolsa de Madrid), STOXX, S&P Dow Jones Indices, Nasdaq, y las webs oficiales de bancos
centrales y organismos estadísticos. No valen como fuente: foros, redes sociales, blogs, webs de
brokers con fines comerciales ni otros agregadores automáticos.

## 4. Estructura del artículo

Archivo `src/content/mercados/AAAA-MM-DD.mdx`:

```mdx
---
title: "Título concreto de lo más importante del día (máx. ~70 caracteres)"
description: "Resumen en una frase de 140-160 caracteres."
pubDate: AAAA-MM-DD
author: "David Pérez Mitjà"
tags: ["mercados", "bce", ...]
sources:
  - label: "Medio o institución: titular o descripción"
    url: "https://..."
  # mínimo 3, idealmente 5-8; todas las fuentes usadas para verificar
---

import datos from '../../data/mercados/AAAA-MM-DD.json';
import MarketSnapshot from '../../components/MarketSnapshot.astro';
import MarketChart from '../../components/MarketChart.astro';

Entradilla: 2-3 frases con lo esencial del día.

## Lo más importante en 30 segundos
- 3-5 viñetas, cada una con un dato verificado.

## [Tema 1]: qué ha pasado
Qué, por qué (causas explicadas) y contexto.

### A qué te afecta
Conexión concreta con el lector: euríbor e hipoteca, fondos indexados, ahorro, precios, empleo.

## [Tema 2] ...

<MarketSnapshot datos={datos} />

<MarketChart datos={datos} serie="..." ultimas={90} />   (1 o 2 gráficas que ilustren el texto)

## Qué vigilar hoy
Agenda del día con hora (hora peninsular española).

## Para entenderlo mejor
Enlace a 1-2 artículos o herramientas del sitio relacionados, si vienen a cuento.
```

Series disponibles para las gráficas: `eurusd`, `eurgbp`, `eurjpy`, `dfr` (tipo de depósito del
BCE), `estr`, `bono2a`, `bono10a`. No hay gráficas de índices bursátiles a propósito (licencias):
los movimientos de bolsa van en el texto, verificados.

Fines de semana: el sábado, resumen de la semana (qué ha movido los mercados y por qué); el
domingo, qué vigilar la semana que viene (agenda de bancos centrales y datos). Mismas reglas.

## 5. Estilo

- Español de España, claro, frases cortas, sin jerga. Si hace falta un término técnico, explicarlo
  en la misma frase.
- **Nunca usar guiones largos** en el texto. Usar coma, punto, dos puntos o paréntesis.
- Cifras en formato español: 1.234,5; 2,5%; 10.000 €.
- Tono sereno. Nada de "desplome histórico" ni "euforia" salvo que los datos lo justifiquen.
- 700-1.200 palabras. Mejor corto y exacto que largo y con relleno.
- Sin imágenes de terceros (derechos de autor). Solo las gráficas propias con datos del BCE.

## 6. Enlaces internos útiles

- Herramientas: `/herramientas/calculadora-inflacion/`, `/herramientas/calculadora-impuestos-venta-fondos/`,
  `/herramientas/comparador-fondo-indexado-vs-etf/`, `/herramientas/calculadora-fondo-de-emergencia/`,
  `/blog/rentabilidad-neta-fondo-indexado/`.
- Artículos (solo los ya publicados, ver `pubDate` en `src/content/blog/`; los enlaces a artículos
  programados se muestran como texto hasta que se publican).
