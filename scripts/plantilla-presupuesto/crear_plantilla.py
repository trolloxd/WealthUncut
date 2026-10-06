"""
Genera la plantilla de presupuesto mensual de WealthUncut (Excel).

Uso (necesita `pip install xlsxwriter`):
    python scripts/plantilla-presupuesto/crear_plantilla.py <ruta-salida.xlsx>

La plantilla se crea desde cero con formulas (SUMIFS, INDEX/MATCH, IFERROR: funciones que existen en Excel,
LibreOffice y Google Sheets). Los numeros de ejemplo son orientativos. Si cambias algo aqui, vuelve a generar el
fichero, abrelo en Excel, comprueba que no hay errores y guardalo en public/descargas/ (ver CLAUDE.md).
"""
import sys
from datetime import date
import xlsxwriter

RUTA = sys.argv[1] if len(sys.argv) > 1 else 'Plantilla-presupuesto-mensual-WealthUncut.xlsx'
CACHE = sys.argv[2] if len(sys.argv) > 2 else None  # xlsx ya calculado por Excel: sus resultados se guardan como valor en caché

# Segunda pasada opcional: si se pasa un xlsx calculado por Excel, cada fórmula lleva su último resultado guardado
# (sin esto, algunas vistas previas, como las de Google Drive o el móvil, enseñarían las celdas vacías hasta recalcular).
_valores = {}
if CACHE:
    import openpyxl
    from openpyxl.utils.datetime import to_excel
    _wv = openpyxl.load_workbook(CACHE, data_only=True)
    for _ws in _wv:
        for _fila in _ws.iter_rows():
            for _c in _fila:
                if _c.value is not None:
                    v = _c.value
                    if hasattr(v, 'year'):
                        v = to_excel(v)
                    _valores[(_ws.title, _c.row - 1, _c.column - 1)] = v
    from xlsxwriter.worksheet import Worksheet as _W
    _orig = _W._write_formula

    def _con_cache(self, row, col, formula, cell_format=None, value=0):
        # si Excel no guardó valor, el resultado era texto vacío
        v = _valores.get((self.name, row, col), '')
        return _orig(self, row, col, formula, cell_format, v)

    _W._write_formula = _con_cache

# Paleta del sitio
VERDE = '#1E4A3A'
VERDE_CLARO = '#E3EDE7'
CREMA = '#FAF6ED'
ROJO = '#B3402A'
ROJO_CLARO = '#F6E3DE'
TINTA = '#1F2A24'
GRIS = '#6B7A72'
BORDE = '#D9D2C0'
AZUL_ENTRADA = '#0000FF'
AMARILLO = '#FFF8DC'

wb = xlsxwriter.Workbook(RUTA)
wb.set_properties({
    'title': 'Plantilla de presupuesto mensual',
    'subject': 'Control de ingresos, gastos, deudas y ahorro',
    'author': 'David Pérez Mitjà · WealthUncut',
    'company': 'WealthUncut',
    'comments': 'Plantilla gratuita de wealthuncut.com. Información educativa, no asesoramiento financiero.',
    'website': 'https://wealthuncut.com/plantilla-presupuesto/',
})

_cache = {}


def F(**kw):
    """Formato con Arial por defecto (se cachea para no duplicar estilos)."""
    base = {'font_name': 'Arial', 'font_size': 10, 'font_color': TINTA, 'valign': 'vcenter'}
    base.update(kw)
    clave = tuple(sorted(base.items()))
    if clave not in _cache:
        _cache[clave] = wb.add_format(base)
    return _cache[clave]


EUR = '#,##0.00 "€"'
EUR0 = '#,##0 "€"'
PCT = '0%'
PCT1 = '0.0%'
FECHA = 'dd/mm/yyyy'

f_base = F()
f_titulo = F(font_size=20, bold=True, font_color=VERDE)
f_sub = F(font_size=10, font_color=GRIS, italic=True)
f_h = F(bold=True, font_color='#FFFFFF', bg_color=VERDE, align='center', border=1, border_color=VERDE, text_wrap=True)
f_hizq = F(bold=True, font_color='#FFFFFF', bg_color=VERDE, align='left', border=1, border_color=VERDE, indent=1)
f_celda = F(border=1, border_color=BORDE)
f_celda_c = F(border=1, border_color=BORDE, align='center')
f_eur = F(border=1, border_color=BORDE, num_format=EUR)
f_eur_b = F(border=1, border_color=BORDE, num_format=EUR, bold=True, bg_color=VERDE_CLARO)
f_pct = F(border=1, border_color=BORDE, num_format=PCT, align='center')
f_pct1 = F(border=1, border_color=BORDE, num_format=PCT1, align='center')
f_fecha = F(border=1, border_color=BORDE, num_format=FECHA, align='center')
f_mes = F(border=1, border_color=BORDE, num_format='mmmm', align='left', indent=1)
# Celdas que rellena la persona: azul sobre fondo claro
f_in = F(border=1, border_color=BORDE, font_color=AZUL_ENTRADA, bg_color=AMARILLO)
f_in_eur = F(border=1, border_color=BORDE, font_color=AZUL_ENTRADA, bg_color=AMARILLO, num_format=EUR)
f_in_fecha = F(border=1, border_color=BORDE, font_color=AZUL_ENTRADA, bg_color=AMARILLO, num_format=FECHA, align='center')
f_in_c = F(border=1, border_color=BORDE, font_color=AZUL_ENTRADA, bg_color=AMARILLO, align='center')
f_tot = F(bold=True, border=1, border_color=BORDE, bg_color=VERDE_CLARO)
f_tot_eur = F(bold=True, border=1, border_color=BORDE, bg_color=VERDE_CLARO, num_format=EUR)
f_tot_pct = F(bold=True, border=1, border_color=BORDE, bg_color=VERDE_CLARO, num_format=PCT1, align='center')
f_aux = F(font_color=GRIS, font_size=9)
f_aux_eur = F(font_color=GRIS, font_size=9, num_format=EUR)
f_nota = F(font_color=GRIS, font_size=9, italic=True, text_wrap=True, valign='top')
f_nota1 = F(font_color=GRIS, font_size=9, italic=True)
EUR_G = '#,##0.00 "€";-#,##0.00 "€";"-"'
f_eur_g = F(border=1, border_color=BORDE, num_format=EUR_G)
f_tot_eur_g = F(bold=True, border=1, border_color=BORDE, bg_color=VERDE_CLARO, num_format=EUR_G)


def hoja(nombre, color):
    ws = wb.add_worksheet(nombre)
    ws.set_row(0, 32)
    ws.set_tab_color(color)
    ws.hide_gridlines(2)
    ws.set_column('A:A', 2, f_base)
    ws.set_default_row(18)
    return ws


# --- Hojas, en el orden en que se ven ---
ws_i = hoja('Instrucciones', VERDE)
ws_r = hoja('Resumen', VERDE)
ws_m = hoja('Movimientos', ROJO)
ws_p = hoja('Presupuesto', ROJO)
ws_a = hoja('Anual', GRIS)
ws_o = hoja('Objetivos', GRIS)
ws_d = hoja('Deudas', GRIS)
ws_l = hoja('Listas', BORDE)

MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
TIPOS = ['Ingreso', 'Factura', 'Gasto', 'Deuda', 'Ahorro']
GRUPOS = ['Necesidad', 'Deseo', 'Ahorro']

# ---------------------------------------------------------------- Listas
ws_l.set_column('B:B', 14)
ws_l.set_column('D:D', 14)
ws_l.set_column('F:F', 14)
ws_l.write('B1', 'Meses', f_hizq)
ws_l.write('D1', 'Tipos', f_hizq)
ws_l.write('F1', 'Grupos', f_hizq)
for i, m in enumerate(MESES):
    ws_l.write(1 + i, 1, m, f_celda)
for i, t in enumerate(TIPOS):
    ws_l.write(1 + i, 3, t, f_celda)
for i, g in enumerate(GRUPOS):
    ws_l.write(1 + i, 5, g, f_celda)
ws_l.write('B16', 'Esta hoja alimenta los desplegables. No hace falta tocarla.', f_nota1)
ws_l.set_column('B:B', 14)
MESES_RANGO = '=Listas!$B$2:$B$13'
TIPOS_RANGO = '=Listas!$D$2:$D$6'
GRUPOS_RANGO = '=Listas!$F$2:$F$4'

# ---------------------------------------------------------------- Presupuesto
P0, P1 = 5, 44  # filas 5..44 (40 categorías)
ws_p.set_column('B:B', 28)
ws_p.set_column('C:C', 11)
ws_p.set_column('D:D', 13)
ws_p.set_column('E:G', 15)
ws_p.set_column('H:H', 10)
ws_p.set_column('I:I', 16)
ws_p.set_column('K:K', 14, f_aux)
ws_p.write('B1', 'Presupuesto por categorías', f_titulo)
ws_p.write('B2', 'Define aquí tus categorías y cuánto quieres gastar o ahorrar en cada una cada mes. La columna "Real del mes" se calcula sola.', f_sub)
heads = ['Categoría', 'Tipo', 'Grupo 50/30/20', 'Presupuesto mensual', 'Real del mes', 'Queda / Diferencia', '% usado', 'Estado']
for i, h in enumerate(heads):
    ws_p.write(3, 1 + i, h, f_h)
ws_p.write(3, 10, 'Auxiliar', f_aux)
ws_p.set_row(3, 30)

CATEGORIAS = [
    # categoría, tipo, grupo, presupuesto
    ('Nómina', 'Ingreso', '', 1100),
    ('Otros ingresos', 'Ingreso', '', 100),
    ('Alquiler o hipoteca', 'Factura', 'Necesidad', 380),
    ('Luz, agua y gas', 'Factura', 'Necesidad', 40),
    ('Móvil e internet', 'Factura', 'Necesidad', 25),
    ('Transporte', 'Factura', 'Necesidad', 40),
    ('Seguros', 'Factura', 'Necesidad', 15),
    ('Supermercado', 'Gasto', 'Necesidad', 130),
    ('Salud y farmacia', 'Gasto', 'Necesidad', 20),
    ('Restaurantes', 'Gasto', 'Deseo', 45),
    ('Ocio y salidas', 'Gasto', 'Deseo', 50),
    ('Ropa y accesorios', 'Gasto', 'Deseo', 50),
    ('Cuidado personal', 'Gasto', 'Deseo', 20),
    ('Gimnasio y deporte', 'Gasto', 'Deseo', 45),
    ('Suscripciones', 'Gasto', 'Deseo', 10),
    ('Viajes y escapadas', 'Gasto', 'Deseo', 60),
    ('Regalos', 'Gasto', 'Deseo', 15),
    ('Imprevistos', 'Gasto', 'Necesidad', 20),
    ('Préstamo o tarjeta', 'Deuda', 'Necesidad', 50),
    ('Fondo de emergencia', 'Ahorro', 'Ahorro', 100),
    ('Inversión (fondos indexados)', 'Ahorro', 'Ahorro', 80),
    ('Ahorro para vacaciones', 'Ahorro', 'Ahorro', 40),
]
MOV0, MOV1 = 6, 505  # filas de Movimientos
R_MES = 'Resumen!$C$5'
SUMA = f'Movimientos!$D${MOV0}:$D${MOV1}'
CAT = f'Movimientos!$C${MOV0}:$C${MOV1}'
MESCOL = f'Movimientos!$F${MOV0}:$F${MOV1}'
TIPOCOL = f'Movimientos!$G${MOV0}:$G${MOV1}'

for r in range(P0, P1 + 1):
    i = r - P0
    fila = r - 1  # índice base 0
    if i < len(CATEGORIAS):
        c, t, g, p = CATEGORIAS[i]
        ws_p.write(fila, 1, c, f_in)
        ws_p.write(fila, 2, t, f_in_c)
        ws_p.write(fila, 3, g, f_in_c)
        ws_p.write(fila, 4, p, f_in_eur)
    else:
        ws_p.write_blank(fila, 1, None, f_in)
        ws_p.write_blank(fila, 2, None, f_in_c)
        ws_p.write_blank(fila, 3, None, f_in_c)
        ws_p.write_blank(fila, 4, None, f_in_eur)
    ws_p.write_formula(fila, 5, f'=IF($B{r}="","",SUMIFS({SUMA},{CAT},$B{r},{MESCOL},{R_MES}))', f_eur)
    ws_p.write_formula(fila, 6, f'=IF($B{r}="","",IF($C{r}="Ingreso",F{r}-E{r},E{r}-F{r}))', f_eur)
    ws_p.write_formula(fila, 7, f'=IF(OR($B{r}="",E{r}=0),"",F{r}/E{r})', f_pct)
    ws_p.write_formula(
        fila, 8,
        f'=IF($B{r}="","",IF($C{r}="Ingreso",IF(F{r}>=E{r},"Objetivo cumplido","Por debajo"),'
        f'IF($C{r}="Ahorro",IF(F{r}>=E{r},"Objetivo cumplido","Te falta ahorrar"),'
        f'IF(F{r}>E{r},"Te has pasado",IF(AND($C{r}="Gasto",F{r}>=0.9*E{r}),"En el límite","Bien")))))',
        f_celda_c)
    # auxiliar: solo salidas de dinero "gastables" (facturas y gastos), para localizar el mayor gasto del mes
    ws_p.write_formula(fila, 10, f'=IF($C{r}="Gasto",N(F{r}),0)', f_aux_eur)

ws_p.data_validation(f'C{P0}:C{P1}', {'validate': 'list', 'source': TIPOS_RANGO})
ws_p.data_validation(f'D{P0}:D{P1}', {'validate': 'list', 'source': GRUPOS_RANGO, 'ignore_blank': True})
ws_p.data_validation(f'E{P0}:E{P1}', {'validate': 'decimal', 'criteria': '>=', 'value': 0,
                                      'error_title': 'Importe no válido', 'error_message': 'Escribe un importe positivo.'})
ws_p.conditional_format(f'G{P0}:G{P1}', {'type': 'formula', 'criteria': f'=AND($C{P0}<>"Ingreso",$C{P0}<>"",N($G{P0})<0)',
                                         'format': F(font_color=ROJO, bold=True)})
ws_p.conditional_format(f'I{P0}:I{P1}', {'type': 'text', 'criteria': 'containing', 'value': 'Te has pasado', 'format': F(font_color=ROJO, bg_color=ROJO_CLARO, bold=True)})
ws_p.conditional_format(f'I{P0}:I{P1}', {'type': 'text', 'criteria': 'containing', 'value': 'Te falta', 'format': F(font_color=ROJO, bg_color=ROJO_CLARO)})
ws_p.conditional_format(f'I{P0}:I{P1}', {'type': 'text', 'criteria': 'containing', 'value': 'límite', 'format': F(font_color='#8A6D00', bg_color='#FFF3C4')})
ws_p.conditional_format(f'I{P0}:I{P1}', {'type': 'text', 'criteria': 'containing', 'value': 'Bien', 'format': F(font_color=VERDE, bg_color=VERDE_CLARO)})
ws_p.conditional_format(f'I{P0}:I{P1}', {'type': 'text', 'criteria': 'containing', 'value': 'cumplido', 'format': F(font_color=VERDE, bg_color=VERDE_CLARO, bold=True)})
ws_p.conditional_format(f'H{P0}:H{P1}', {'type': 'data_bar', 'bar_color': '#7FA392', 'bar_solid': True, 'min_type': 'num', 'min_value': 0, 'max_type': 'num', 'max_value': 1.2})
ws_p.write(P1 + 1, 1, 'Celdas en azul sobre fondo amarillo: las rellenas tú. Puedes añadir categorías en las filas vacías.', f_nota1)
ws_p.freeze_panes(4, 2)
ws_p.set_landscape()
ws_p.fit_to_pages(1, 1)
ws_p.print_area(f'B1:I{P0 + len(CATEGORIAS) + 2}')

# ---------------------------------------------------------------- Movimientos
ws_m.set_column('B:B', 12)
ws_m.set_column('C:C', 28)
ws_m.set_column('D:D', 14)
ws_m.set_column('E:E', 34)
ws_m.set_column('F:F', 14)
ws_m.set_column('G:G', 12)
ws_m.write('B1', 'Movimientos', f_titulo)
ws_m.write('B2', 'Apunta aquí cada gasto, ingreso, pago de deuda o aportación al ahorro. Escribe siempre el importe en positivo: el Tipo lo pone la categoría.', f_sub)
ws_m.write('B3', 'Movimientos registrados:', F(bold=True))
ws_m.write_formula('D3', f'=COUNT(B{MOV0}:B{MOV1})', F(bold=True, num_format='0', align='left'))
for i, h in enumerate(['Fecha', 'Categoría', 'Importe (€)', 'Concepto (opcional)', 'Mes (auto)', 'Tipo (auto)']):
    ws_m.write(4, 1 + i, h, f_h)
ws_m.set_row(4, 24)

# datos de ejemplo: julio, agosto y septiembre de 2026
EJ = []


def mov(d, m, a, cat, imp, con=''):
    EJ.append((date(a, m, d), cat, imp, con))


for m, extra in ((7, 0), (8, 25), (9, 0)):
    a = 2026
    mov(1, m, a, 'Nómina', 1100, 'Nómina del mes')
    if m == 8:
        mov(14, m, a, 'Otros ingresos', 80, 'Venta de segunda mano')
    if m == 9:
        mov(18, m, a, 'Otros ingresos', 180, 'Clases particulares')
    mov(2, m, a, 'Alquiler o hipoteca', 380, 'Habitación')
    mov(5, m, a, 'Luz, agua y gas', 36 + (m % 3) * 3)
    mov(5, m, a, 'Móvil e internet', 25)
    mov(3, m, a, 'Transporte', 40, 'Abono mensual')
    mov(6, m, a, 'Seguros', 15)
    for d, imp in ((4, 22.4), (11, 31.7), (17, 24.15), (24, 28.9)):
        mov(d, m, a, 'Supermercado', round(imp + (m - 7) * 1.3, 2), 'Compra de la semana')
    mov(9, m, a, 'Restaurantes', 18.65, 'Cena con amigos')
    mov(21, m, a, 'Restaurantes', 22.97 + (m - 7) * 2)
    mov(12, m, a, 'Ocio y salidas', 25.5)
    mov(26, m, a, 'Ocio y salidas', 19.3 + (m - 7) * 4)
    mov(15, m, a, 'Cuidado personal', 20, 'Peluquería')
    mov(1, m, a, 'Gimnasio y deporte', 40.96)
    mov(8, m, a, 'Suscripciones', 7.49)
    mov(27, m, a, 'Imprevistos', 12 + extra)
    mov(10, m, a, 'Préstamo o tarjeta', 50)
    mov(5, m, a, 'Fondo de emergencia', 100)
    mov(5, m, a, 'Inversión (fondos indexados)', 80)
    mov(5, m, a, 'Ahorro para vacaciones', 40)
mov(19, 9, 2026, 'Viajes y escapadas', 106.43, 'Escapada de fin de semana')
mov(23, 9, 2026, 'Ropa y accesorios', 74, 'Gafas de sol')
mov(14, 8, 2026, 'Regalos', 22.5)
mov(28, 7, 2026, 'Salud y farmacia', 14.2)
mov(16, 9, 2026, 'Salud y farmacia', 9.6)
EJ.sort(key=lambda x: x[0])

for r in range(MOV0, MOV1 + 1):
    fila = r - 1
    i = r - MOV0
    if i < len(EJ):
        d, cat, imp, con = EJ[i]
        ws_m.write_datetime(fila, 1, __import__('datetime').datetime(d.year, d.month, d.day), f_in_fecha)
        ws_m.write(fila, 2, cat, f_in)
        ws_m.write_number(fila, 3, imp, f_in_eur)
        ws_m.write(fila, 4, con, f_in)
    else:
        ws_m.write_blank(fila, 1, None, f_in_fecha)
        ws_m.write_blank(fila, 2, None, f_in)
        ws_m.write_blank(fila, 3, None, f_in_eur)
        ws_m.write_blank(fila, 4, None, f_in)
    ws_m.write_formula(fila, 5, f'=IF($B{r}="","",DATE(YEAR($B{r}),MONTH($B{r}),1))', F(border=1, border_color=BORDE, num_format='mmm yyyy', align='center', font_color=GRIS))
    ws_m.write_formula(fila, 6, f'=IF($C{r}="","",IFERROR(INDEX(Presupuesto!$C${P0}:$C${P1},MATCH($C{r},Presupuesto!$B${P0}:$B${P1},0)),"¿Categoría?"))', F(border=1, border_color=BORDE, align='center', font_color=GRIS))
ws_m.data_validation(f'B{MOV0}:B{MOV1}', {'validate': 'date', 'criteria': '>=', 'value': date(2000, 1, 1),
                                          'error_title': 'Fecha no válida', 'error_message': 'Escribe una fecha, por ejemplo 15/09/2026.'})
ws_m.data_validation(f'C{MOV0}:C{MOV1}', {'validate': 'list', 'source': f'=Presupuesto!$B${P0}:$B${P1}',
                                          'error_title': 'Categoría no encontrada', 'error_message': 'Elige una categoría de la lista o créala antes en la hoja Presupuesto.'})
ws_m.data_validation(f'D{MOV0}:D{MOV1}', {'validate': 'decimal', 'criteria': '>=', 'value': 0,
                                          'error_title': 'Importe no válido', 'error_message': 'Escribe el importe en positivo (sin signo menos).'})
ws_m.conditional_format(f'G{MOV0}:G{MOV1}', {'type': 'text', 'criteria': 'containing', 'value': 'Categoría?', 'format': F(font_color=ROJO, bg_color=ROJO_CLARO, bold=True)})
ws_m.autofilter(f'B5:G{MOV1}')
ws_m.freeze_panes(5, 0)
ws_m.set_landscape()
ws_m.fit_to_pages(1, 1)
ws_m.print_area(f'B1:G{MOV0 + 34}')

# ---------------------------------------------------------------- Resumen
ws_r.set_column('B:M', 12.5)
ws_r.set_column('N:N', 3)
ws_r.set_column('O:P', 14, f_aux)
ws_r.write('B1', 'Presupuesto mensual', f_titulo)
ws_r.write('B2', 'Elige el mes y mira cómo vas: ingresos, gastos, deuda y ahorro, con tu presupuesto al lado. Todo se calcula solo a partir de tus movimientos.', f_sub)
ws_r.write('B4', 'Mes', F(bold=True))
ws_r.write('C4', 'Septiembre', f_in_c)
ws_r.write('D4', 'Año', F(bold=True, align='right'))
ws_r.write_number('E4', 2026, f_in_c)
ws_r.data_validation('C4', {'validate': 'list', 'source': MESES_RANGO})
ws_r.data_validation('E4', {'validate': 'integer', 'criteria': 'between', 'minimum': 2000, 'maximum': 2100})
ws_r.write('B5', 'Mes calculado', F(font_color=GRIS))
ws_r.merge_range('C5:D5', '', F(num_format='mmmm yyyy', font_color=GRIS, align='center'))
ws_r.write_formula('C5', '=DATE($E$4,MATCH($C$4,Listas!$B$2:$B$13,0),1)', F(num_format='mmmm yyyy', font_color=GRIS, align='center'))
ws_r.merge_range('G4:I4', 'Saldo en cuenta el día 1 (€)', F(bold=True, align='right'))
ws_r.write_number('J4', 650, f_in_eur)

# Tarjetas
tarjetas = [
    ('B', 'C', 'INGRESOS', 'Ingreso', VERDE),
    ('D', 'E', 'FACTURAS', 'Factura', VERDE),
    ('F', 'G', 'GASTOS', 'Gasto', VERDE),
    ('H', 'I', 'DEUDA', 'Deuda', VERDE),
    ('J', 'K', 'AHORRO', 'Ahorro', VERDE),
]
BUD = f'Presupuesto!$E${P0}:$E${P1}'
REAL = f'Presupuesto!$F${P0}:$F${P1}'
TIP = f'Presupuesto!$C${P0}:$C${P1}'
GRP = f'Presupuesto!$D${P0}:$D${P1}'
ws_r.set_row(7, 20)
ws_r.set_row(8, 34)
for a, b, nombre, tipo, col in tarjetas:
    ws_r.merge_range(f'{a}8:{b}8', nombre, F(bold=True, font_color='#FFFFFF', bg_color=col, align='center', font_size=9))
    ws_r.merge_range(f'{a}9:{b}9', '', F(bold=True, font_size=17, align='center', bg_color=CREMA, num_format=EUR0, border=1, border_color=BORDE))
    ws_r.write_formula(f'{a}9', f'=SUMIFS({REAL},{TIP},"{tipo}")', F(bold=True, font_size=17, align='center', bg_color=CREMA, num_format=EUR0, border=1, border_color=BORDE))
    ws_r.merge_range(f'{a}10:{b}10', '', F(font_size=8, font_color=GRIS, align='center', italic=True))
    ws_r.write_formula(f'{a}10', f'="de "&FIXED(SUMIFS({BUD},{TIP},"{tipo}"),0)&" € presupuestados"', F(font_size=8, font_color=GRIS, align='center', italic=True))
ws_r.merge_range('L8:M8', 'TE QUEDA', F(bold=True, font_color='#FFFFFF', bg_color=ROJO, align='center', font_size=9))
ws_r.merge_range('L9:M9', '', F(bold=True, font_size=17, align='center', bg_color=CREMA, num_format=EUR0, border=1, border_color=BORDE))
ws_r.write_formula('L9', '=B9-D9-F9-H9-J9', F(bold=True, font_size=17, align='center', bg_color=CREMA, num_format=EUR0, border=1, border_color=BORDE))
ws_r.merge_range('L10:M10', 'ingresos menos todo lo anterior', F(font_size=8, font_color=GRIS, align='center', italic=True))
ws_r.conditional_format('L9', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': F(font_color=ROJO)})

# Resumen de flujo de caja
ws_r.write('B12', 'FLUJO DE CAJA DEL MES', F(bold=True, font_color=VERDE, font_size=11))
for i, h in enumerate(['', 'Presupuesto', 'Real', 'Diferencia']):
    if i == 0:
        ws_r.merge_range('B13:C13', 'Concepto', f_hizq)
    else:
        ws_r.write(12, 2 + i, h, f_h)
filas_cf = [
    ('Saldo inicial', None),
    ('Ingresos', 'Ingreso'),
    ('Facturas', 'Factura'),
    ('Gastos', 'Gasto'),
    ('Deuda', 'Deuda'),
    ('Ahorro', 'Ahorro'),
    ('Saldo final', 'FIN'),
]
for k, (nombre, tipo) in enumerate(filas_cf):
    r = 14 + k
    ws_r.merge_range(f'B{r}:C{r}', nombre, f_tot if tipo == 'FIN' else f_celda)
    if tipo is None:
        ws_r.write_formula(f'D{r}', '=$J$4', f_eur)
        ws_r.write_formula(f'E{r}', '=$J$4', f_eur)
        ws_r.write_formula(f'F{r}', f'=E{r}-D{r}', f_eur)
    elif tipo == 'FIN':
        ws_r.write_formula(f'D{r}', '=D14+D15-D16-D17-D18-D19', f_tot_eur)
        ws_r.write_formula(f'E{r}', '=E14+E15-E16-E17-E18-E19', f_tot_eur)
        ws_r.write_formula(f'F{r}', f'=E{r}-D{r}', f_tot_eur)
    else:
        ws_r.write_formula(f'D{r}', f'=SUMIFS({BUD},{TIP},"{tipo}")', f_eur)
        ws_r.write_formula(f'E{r}', f'=SUMIFS({REAL},{TIP},"{tipo}")', f_eur)
        # para ingresos, positivo = has ingresado más; para salidas, positivo = has gastado menos de lo previsto
        ws_r.write_formula(f'F{r}', f'=E{r}-D{r}' if tipo == 'Ingreso' else f'=D{r}-E{r}', f_eur)
ws_r.conditional_format('F15:F20', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': F(font_color=ROJO, bold=True)})
ws_r.write('B21', 'Diferencia: positiva = vas mejor que lo previsto (más ingresos o menos gasto).', f_nota1)

# Regla 50/30/20
ws_r.write('H12', 'REGLA 50/30/20', F(bold=True, font_color=VERDE, font_size=11))
for i, h in enumerate(['Grupo', 'Ideal', 'Real', 'Importe']):
    ws_r.write(12, 7 + i, h, f_h if i else f_hizq)
ws_r.merge_range('L13:M13', 'Estado', f_h)
reglas = [('Necesidades', 0.5, 'Necesidad', '<='), ('Deseos', 0.3, 'Deseo', '<='), ('Ahorro', 0.2, 'Ahorro', '>=')]
for k, (nombre, ideal, grupo, cmp_) in enumerate(reglas):
    r = 14 + k
    ws_r.write(f'H{r}', nombre, f_celda)
    ws_r.write_number(f'I{r}', ideal, f_pct)
    ws_r.write_formula(f'K{r}', f'=SUMIFS({REAL},{GRP},"{grupo}")', f_eur)
    ws_r.write_formula(f'J{r}', f'=IF($B$9=0,0,K{r}/$B$9)', f_pct)
    ok = 'Dentro' if cmp_ == '<=' else 'Cumples'
    ko = 'Por encima' if cmp_ == '<=' else 'Por debajo'
    ws_r.merge_range(f'L{r}:M{r}', '', f_celda_c)
    ws_r.write_formula(f'L{r}', f'=IF($B$9=0,"Sin ingresos",IF(J{r}{cmp_}I{r},"{ok}","{ko}"))', f_celda_c)
for cond, fm in (('Dentro', F(font_color=VERDE, bg_color=VERDE_CLARO, bold=True)), ('Cumples', F(font_color=VERDE, bg_color=VERDE_CLARO, bold=True)),
                 ('Por', F(font_color=ROJO, bg_color=ROJO_CLARO, bold=True))):
    ws_r.conditional_format('L14:M16', {'type': 'text', 'criteria': 'begins with', 'value': cond, 'format': fm})
ws_r.write('H17', '% sobre tus ingresos reales del mes.', f_nota1)

# Mayor gasto
ws_r.write('H19', 'Tu mayor gasto del mes', F(bold=True, font_color=VERDE))
ws_r.merge_range('H20:J20', '', F(bold=True, border=1, border_color=BORDE, font_size=11))
ws_r.write_formula('H20', f'=IF(MAX(Presupuesto!$K${P0}:$K${P1})=0,"Aún sin datos",INDEX(Presupuesto!$B${P0}:$B${P1},MATCH(MAX(Presupuesto!$K${P0}:$K${P1}),Presupuesto!$K${P0}:$K${P1},0)))',
                   F(bold=True, border=1, border_color=BORDE, font_size=11))
ws_r.write_formula('K20', f'=MAX(Presupuesto!$K${P0}:$K${P1})', F(bold=True, border=1, border_color=BORDE, num_format=EUR, font_size=11))
ws_r.write('H21', 'Entre tus gastos (sin facturas, deuda ni ahorro).', f_nota1)

# Datos auxiliares para el gráfico de donut
ws_r.write('O12', 'Datos de los gráficos', F(bold=True, font_color=GRIS, font_size=9))
aux = [('Facturas', '=D9'), ('Gastos', '=F9'), ('Deuda', '=H9'), ('Ahorro', '=J9'), ('Te queda', '=MAX(0,L9)')]
for k, (n, fo) in enumerate(aux):
    ws_r.write(12 + k, 14, n, f_aux)
    ws_r.write_formula(12 + k, 15, fo, f_aux_eur)

# Gráficos
c1 = wb.add_chart({'type': 'doughnut'})
c1.add_series({
    'name': '¿A dónde va tu dinero?',
    'categories': '=Resumen!$O$13:$O$17',
    'values': '=Resumen!$P$13:$P$17',
    'points': [{'fill': {'color': '#1E4A3A'}}, {'fill': {'color': '#4F7F6C'}}, {'fill': {'color': '#B3402A'}}, {'fill': {'color': '#D8A65C'}}, {'fill': {'color': '#CFC8B4'}}],
    'data_labels': {'percentage': True, 'font': {'name': 'Arial', 'size': 9, 'color': '#FFFFFF', 'bold': True}},
})
c1.set_title({'name': '¿A dónde va tu dinero?', 'name_font': {'name': 'Arial', 'size': 11, 'bold': True, 'color': VERDE}})
c1.set_hole_size(55)
c1.set_legend({'position': 'right', 'font': {'name': 'Arial', 'size': 9}})
c1.set_size({'width': 360, 'height': 280})
c1.set_chartarea({'border': {'color': BORDE}, 'fill': {'color': '#FFFFFF'}})
ws_r.insert_chart('B23', c1, {'x_offset': 0, 'y_offset': 6})

c2 = wb.add_chart({'type': 'bar'})
c2.add_series({'name': 'Presupuesto', 'categories': '=Resumen!$B$15:$B$19', 'values': '=Resumen!$D$15:$D$19', 'fill': {'color': '#B9C9BF'}, 'gap': 60})
c2.add_series({'name': 'Real', 'categories': '=Resumen!$B$15:$B$19', 'values': '=Resumen!$E$15:$E$19', 'fill': {'color': VERDE}})
c2.set_title({'name': 'Presupuesto frente a real', 'name_font': {'name': 'Arial', 'size': 11, 'bold': True, 'color': VERDE}})
c2.set_legend({'position': 'bottom', 'font': {'name': 'Arial', 'size': 9}})
c2.set_x_axis({'num_format': '#,##0', 'num_font': {'name': 'Arial', 'size': 8}, 'major_gridlines': {'visible': True, 'line': {'color': '#E8E3D3'}}})
c2.set_y_axis({'reverse': True, 'num_font': {'name': 'Arial', 'size': 9}})
c2.set_size({'width': 360, 'height': 280})
c2.set_chartarea({'border': {'color': BORDE}, 'fill': {'color': '#FFFFFF'}})
ws_r.insert_chart('F23', c2, {'x_offset': 0, 'y_offset': 6})

c3 = wb.add_chart({'type': 'column'})
c3.add_series({'name': 'Ideal', 'categories': '=Resumen!$H$14:$H$16', 'values': '=Resumen!$I$14:$I$16', 'fill': {'color': '#B9C9BF'}, 'gap': 80,
               'data_labels': {'value': True, 'num_format': '0%', 'font': {'name': 'Arial', 'size': 8}}})
c3.add_series({'name': 'Real', 'categories': '=Resumen!$H$14:$H$16', 'values': '=Resumen!$J$14:$J$16', 'fill': {'color': ROJO},
               'data_labels': {'value': True, 'num_format': '0%', 'font': {'name': 'Arial', 'size': 8}}})
c3.set_title({'name': 'Tu reparto frente al 50/30/20', 'name_font': {'name': 'Arial', 'size': 11, 'bold': True, 'color': VERDE}})
c3.set_legend({'position': 'bottom', 'font': {'name': 'Arial', 'size': 9}})
c3.set_y_axis({'num_format': '0%', 'num_font': {'name': 'Arial', 'size': 8}, 'major_gridlines': {'visible': True, 'line': {'color': '#E8E3D3'}}, 'min': 0})
c3.set_x_axis({'num_font': {'name': 'Arial', 'size': 9}})
c3.set_size({'width': 360, 'height': 280})
c3.set_chartarea({'border': {'color': BORDE}, 'fill': {'color': '#FFFFFF'}})
ws_r.insert_chart('J23', c3, {'x_offset': 0, 'y_offset': 6})
ws_r.write('B38', 'Plantilla de WealthUncut (wealthuncut.com). Información educativa, no es asesoramiento financiero.', f_nota1)
ws_r.set_landscape()
ws_r.fit_to_pages(1, 1)
ws_r.print_area('B1:N38')

# ---------------------------------------------------------------- Anual
ws_a.set_column('B:B', 14)
ws_a.set_column('C:J', 14)
ws_a.write('B1', 'Vista anual', F(font_size=20, bold=True, font_color=VERDE))
ws_a.write_formula('B2', '="Año "&Resumen!$E$4&": cómo evolucionan tus ingresos, tu gasto y tu ahorro mes a mes."', f_sub)
for i, h in enumerate(['Mes', 'Ingresos', 'Facturas', 'Gastos', 'Deuda', 'Ahorro', 'Te queda', 'Tasa de ahorro', 'Ahorro acumulado']):
    ws_a.write(3, 1 + i, h, f_h)
ws_a.set_row(3, 30)
for k in range(12):
    r = 5 + k
    ws_a.write_formula(f'B{r}', f'=DATE(Resumen!$E$4,{k + 1},1)', f_mes)
    for col, tipo in zip('CDEFG', TIPOS):
        ws_a.write_formula(f'{col}{r}', f'=SUMIFS({SUMA},{TIPOCOL},"{tipo}",{MESCOL},$B{r})', f_eur_g)
    ws_a.write_formula(f'H{r}', f'=C{r}-D{r}-E{r}-F{r}-G{r}', f_eur_g)
    ws_a.write_formula(f'I{r}', f'=IF(C{r}=0,"",G{r}/C{r})', f_pct1)
    ws_a.write_formula(f'J{r}', f'=IF(COUNTIFS({MESCOL},$B{r})=0,"",SUM($G$5:G{r}))', f_eur_g)
    # columnas auxiliares (ocultas) para que el gráfico no dibuje meses sin datos
    ws_a.write_formula(f'L{r}', f'=IF(COUNTIFS({MESCOL},$B{r})=0,NA(),C{r})', f_aux_eur)
    ws_a.write_formula(f'M{r}', f'=IF(COUNTIFS({MESCOL},$B{r})=0,NA(),SUM($G$5:G{r}))', f_aux_eur)
ws_a.set_column('L:M', 14, None, {'hidden': True})
ws_a.write('B17', 'Total', f_tot)
for col in 'CDEFGH':
    ws_a.write_formula(f'{col}17', f'=SUM({col}5:{col}16)', f_tot_eur)
ws_a.write_formula('I17', '=IF(C17=0,"",G17/C17)', f_tot_pct)
ws_a.write_formula('J17', '=MAX(J5:J16)', f_tot_eur)
ws_a.conditional_format('H5:H16', {'type': 'cell', 'criteria': '<', 'value': 0, 'format': F(font_color=ROJO, bold=True)})
ws_a.conditional_format('I5:I16', {'type': 'data_bar', 'bar_color': '#7FA392', 'bar_solid': True, 'min_type': 'num', 'min_value': 0, 'max_type': 'num', 'max_value': 0.5})

ca = wb.add_chart({'type': 'column', 'subtype': 'stacked'})
for nom, col, color in (('Facturas', 'D', '#1E4A3A'), ('Gastos', 'E', '#4F7F6C'), ('Deuda', 'F', '#B3402A'), ('Ahorro', 'G', '#D8A65C')):
    ca.add_series({'name': f'=Anual!${col}$4', 'categories': '=Anual!$B$5:$B$16', 'values': f'=Anual!${col}$5:${col}$16', 'fill': {'color': color}, 'gap': 60})
cl = wb.add_chart({'type': 'line'})
cl.add_series({'name': '=Anual!$C$4', 'categories': '=Anual!$B$5:$B$16', 'values': '=Anual!$L$5:$L$16', 'line': {'color': '#000000', 'width': 2.25},
               'marker': {'type': 'circle', 'size': 6, 'fill': {'color': '#FFFFFF'}, 'border': {'color': '#000000'}}})
ca.combine(cl)
ca.set_title({'name': 'Ingresos y destino del dinero, mes a mes', 'name_font': {'name': 'Arial', 'size': 11, 'bold': True, 'color': VERDE}})
ca.set_legend({'position': 'bottom', 'font': {'name': 'Arial', 'size': 9}})
ca.set_x_axis({'num_format': 'mmm', 'num_font': {'name': 'Arial', 'size': 9}})
ca.set_y_axis({'num_format': '#,##0', 'num_font': {'name': 'Arial', 'size': 8}, 'major_gridlines': {'visible': True, 'line': {'color': '#E8E3D3'}}})
ca.set_size({'width': 560, 'height': 300})
ca.set_chartarea({'border': {'color': BORDE}})
ca.show_hidden_data()
ws_a.insert_chart('B19', ca)

cb = wb.add_chart({'type': 'line'})
cb.add_series({'name': 'Ahorro acumulado', 'categories': '=Anual!$B$5:$B$16', 'values': '=Anual!$M$5:$M$16', 'line': {'color': VERDE, 'width': 2.75},
               'marker': {'type': 'circle', 'size': 6, 'fill': {'color': VERDE}, 'border': {'color': VERDE}}})
cb.set_title({'name': 'Ahorro acumulado en el año', 'name_font': {'name': 'Arial', 'size': 11, 'bold': True, 'color': VERDE}})
cb.set_legend({'none': True})
cb.set_x_axis({'num_format': 'mmm', 'num_font': {'name': 'Arial', 'size': 9}})
cb.set_y_axis({'num_format': '#,##0', 'num_font': {'name': 'Arial', 'size': 8}, 'major_gridlines': {'visible': True, 'line': {'color': '#E8E3D3'}}})
cb.set_size({'width': 380, 'height': 300})
cb.set_chartarea({'border': {'color': BORDE}})
cb.show_hidden_data()
ws_a.insert_chart('G19', cb, {'x_offset': 60})
ws_a.set_landscape()
ws_a.fit_to_pages(1, 1)
ws_a.print_area('B1:L35')

# ---------------------------------------------------------------- Objetivos
ws_o.set_column('B:B', 30)
ws_o.set_column('C:D', 15)
ws_o.set_column('E:E', 16)
ws_o.set_column('F:F', 15)
ws_o.set_column('G:G', 14)
ws_o.set_column('H:H', 20)
ws_o.write('B1', 'Objetivos de ahorro', F(font_size=20, bold=True, font_color=VERDE))
ws_o.write('B2', 'Pon una meta, una fecha y lo que llevas ahorrado. La plantilla calcula cuánto te falta y cuánto tendrías que apartar cada mes.', f_sub)
for i, h in enumerate(['Objetivo', 'Meta (€)', 'Ahorrado (€)', 'Fecha objetivo', 'Te falta (€)', 'Progreso', 'Ahorro mensual necesario']):
    ws_o.write(3, 1 + i, h, f_h)
ws_o.set_row(3, 30)
OBJ = [
    ('Fondo de emergencia (3 meses de gastos)', 2400, 900, date(2027, 6, 30)),
    ('Vacaciones del verano', 900, 250, date(2027, 6, 1)),
    ('Portátil nuevo', 1000, 420, date(2027, 3, 31)),
    ('Entrada de un piso', 30000, 3200, date(2031, 12, 31)),
]
import datetime as _dt
for k in range(10):
    r = 5 + k
    if k < len(OBJ):
        n, meta, ah, fe = OBJ[k]
        ws_o.write(f'B{r}', n, f_in)
        ws_o.write_number(f'C{r}', meta, f_in_eur)
        ws_o.write_number(f'D{r}', ah, f_in_eur)
        ws_o.write_datetime(f'E{r}', _dt.datetime(fe.year, fe.month, fe.day), f_in_fecha)
    else:
        ws_o.write_blank(f'B{r}', None, f_in)
        ws_o.write_blank(f'C{r}', None, f_in_eur)
        ws_o.write_blank(f'D{r}', None, f_in_eur)
        ws_o.write_blank(f'E{r}', None, f_in_fecha)
    ws_o.write_formula(f'F{r}', f'=IF($B{r}="","",MAX(0,C{r}-D{r}))', f_eur)
    ws_o.write_formula(f'G{r}', f'=IF(OR($B{r}="",N(C{r})=0),"",MIN(1,D{r}/C{r}))', f_pct)
    ws_o.write_formula(f'H{r}', f'=IF(OR($B{r}="",E{r}="",N(F{r})=0),"",F{r}/MAX(1,(YEAR(E{r})-YEAR(TODAY()))*12+MONTH(E{r})-MONTH(TODAY())))', f_eur)
ws_o.conditional_format('G5:G14', {'type': 'data_bar', 'bar_color': '#7FA392', 'bar_solid': True, 'min_type': 'num', 'min_value': 0, 'max_type': 'num', 'max_value': 1})
ws_o.write('B16', 'El ahorro mensual necesario se calcula con los meses que quedan desde hoy hasta la fecha objetivo (mínimo 1).', f_nota1)
ws_o.write('B17', 'Para saber cuánto guardar de colchón, usa la calculadora de fondo de emergencia de wealthuncut.com.', f_nota1)
ws_o.set_landscape()
ws_o.fit_to_pages(1, 1)
ws_o.print_area('B1:H17')

# ---------------------------------------------------------------- Deudas
ws_d.set_column('B:B', 28)
ws_d.set_column('C:H', 16)
ws_d.write('B1', 'Deudas', F(font_size=20, bold=True, font_color=VERDE))
ws_d.write('B2', 'Apunta lo que debes y la plantilla calcula cuántos meses te faltan para terminar de pagar y cuántos intereses te quedan.', f_sub)
for i, h in enumerate(['Deuda', 'Saldo pendiente (€)', 'Interés anual (TIN %)', 'Cuota mensual (€)', 'Meses que faltan', 'Libre de deuda en', 'Intereses que te quedan']):
    ws_d.write(3, 1 + i, h, f_h)
ws_d.set_row(3, 30)
DEU = [('Préstamo de estudios', 3800, 3.5, 50), ('Tarjeta de crédito', 450, 20, 45)]
f_in_pct = F(border=1, border_color=BORDE, font_color=AZUL_ENTRADA, bg_color=AMARILLO, num_format='0.00')
for k in range(8):
    r = 5 + k
    if k < len(DEU):
        n, sal, tin, cu = DEU[k]
        ws_d.write(f'B{r}', n, f_in)
        ws_d.write_number(f'C{r}', sal, f_in_eur)
        ws_d.write_number(f'D{r}', tin, f_in_pct)
        ws_d.write_number(f'E{r}', cu, f_in_eur)
    else:
        ws_d.write_blank(f'B{r}', None, f_in)
        ws_d.write_blank(f'C{r}', None, f_in_eur)
        ws_d.write_blank(f'D{r}', None, f_in_pct)
        ws_d.write_blank(f'E{r}', None, f_in_eur)
    ws_d.write_formula(f'F{r}', f'=IF(OR($B{r}="",N(C{r})=0,N(E{r})=0),"",IFERROR(IF(N(D{r})=0,C{r}/E{r},NPER(D{r}/100/12,-E{r},C{r})),"Cuota insuficiente"))',
                       F(border=1, border_color=BORDE, num_format='0.0', align='center'))
    ws_d.write_formula(f'G{r}', f'=IF(ISNUMBER(F{r}),EDATE(TODAY(),ROUNDUP(F{r},0)),"")', F(border=1, border_color=BORDE, num_format='mmm yyyy', align='center'))
    ws_d.write_formula(f'H{r}', f'=IF(ISNUMBER(F{r}),MAX(0,E{r}*F{r}-C{r}),"")', f_eur)
ws_d.write('B14', 'Total', f_tot)
ws_d.write_formula('C14', '=SUM(C5:C12)', f_tot_eur)
ws_d.write_blank('D14', None, f_tot)
ws_d.write_formula('E14', '=SUM(E5:E12)', f_tot_eur)
ws_d.write_blank('F14', None, f_tot)
ws_d.write_blank('G14', None, f_tot)
ws_d.write_formula('H14', '=SUM(H5:H12)', f_tot_eur)
ws_d.write('B16', 'Los intereses son una estimación (cuota por meses menos saldo). Si pagas más de la cuota, terminarás antes.', f_nota1)
ws_d.write('B17', 'Una idea habitual: si tienes varias deudas, la que cobra más interés es la que más cuesta mantener.', f_nota1)
ws_d.set_landscape()
ws_d.fit_to_pages(1, 1)
ws_d.print_area('B1:H17')

# ---------------------------------------------------------------- Instrucciones
ws_i.set_column('B:B', 4)
ws_i.set_column('C:C', 92)
ws_i.write('B1', 'Plantilla de presupuesto mensual', f_titulo)
ws_i.write('B2', 'Por WealthUncut · wealthuncut.com · Gratis para uso personal', f_sub)
ws_i.merge_range('B4:C4', 'CÓMO USARLA EN 5 PASOS', f_hizq)
pasos = [
    ('1', 'En la hoja Presupuesto, revisa las categorías y escribe cuánto quieres gastar o ahorrar en cada una cada mes. Cambia los nombres por los tuyos y añade más en las filas vacías.'),
    ('2', 'Cada vez que gastes, cobres, pagues una deuda o apartes ahorro, apúntalo en la hoja Movimientos: fecha, categoría (desplegable) e importe en positivo. El Tipo se pone solo.'),
    ('3', 'En la hoja Resumen, elige el mes y el año y escribe tu saldo en cuenta el día 1. Verás tus ingresos, gastos, deuda y ahorro, el presupuesto al lado y los gráficos.'),
    ('4', 'Mira la regla 50/30/20 y la columna "Estado" de Presupuesto: te dicen qué categorías te estás pasando y cuánto te queda por gastar.'),
    ('5', 'En Objetivos pon tus metas de ahorro, en Deudas lo que debes y en Anual comprueba cómo evoluciona el año completo.'),
]
for k, (n, t) in enumerate(pasos):
    r = 5 + k
    ws_i.write(f'B{r}', n, F(bold=True, font_color=VERDE, align='center', font_size=12))
    ws_i.write(f'C{r}', t, F(text_wrap=True))
    ws_i.set_row(r - 1, 34)
ws_i.merge_range('B11:C11', 'QUÉ SIGNIFICAN LOS COLORES', f_hizq)
ws_i.write('B12', '', f_in)
ws_i.write('C12', 'Fondo amarillo con letra azul: las celdas que rellenas tú (importes, fechas, categorías, saldo).', F())
ws_i.write('B13', '', F(bg_color=VERDE_CLARO, border=1, border_color=BORDE))
ws_i.write('C13', 'Fondo verde claro: totales. Se calculan solos, no los toques.', F())
ws_i.write('B14', '', F(bg_color=ROJO_CLARO, border=1, border_color=BORDE))
ws_i.write('C14', 'Rojo: te has pasado de presupuesto, te falta algo o hay un error (por ejemplo una categoría que no existe).', F())
ws_i.merge_range('B16:C16', 'CONSEJOS', f_hizq)
consejos = [
    'Apunta los movimientos el mismo día o una vez por semana: dos minutos bastan. Lo que no se apunta no se puede revisar.',
    'Usa pocas categorías (15 o 20). Si necesitas más detalle, pon el detalle en el campo "Concepto".',
    'No escribas importes negativos: pon siempre el número en positivo; el tipo de la categoría decide si suma o resta.',
    'Si quieres empezar un mes nuevo no hace falta borrar nada: sigue apuntando y cambia el mes en la hoja Resumen.',
    'Para empezar de cero, selecciona las filas de ejemplo en Movimientos (columnas B a E) y bórralas.',
    'Los números que vienen son un ejemplo para que veas cómo funciona. No son una recomendación de cuánto gastar ni ahorrar.',
]
for k, t in enumerate(consejos):
    r = 17 + k
    ws_i.write(f'B{r}', '•', F(align='center', font_color=VERDE, bold=True))
    ws_i.write(f'C{r}', t, F(text_wrap=True))
    ws_i.set_row(r - 1, 30)
ws_i.merge_range('B24:C24', 'IR A…', f_hizq)
for k, (h, txt) in enumerate((('Resumen', 'Resumen: tu panel del mes'), ('Movimientos', 'Movimientos: apunta aquí tus gastos e ingresos'),
                              ('Presupuesto', 'Presupuesto: tus categorías y límites'), ('Anual', 'Anual: el año completo'), ('Objetivos', 'Objetivos: tus metas de ahorro'), ('Deudas', 'Deudas: cuánto te falta para terminar de pagar'))):
    ws_i.write_url(f'C{25 + k}', f"internal:'{h}'!A1", F(font_color='#0563C1', underline=1), txt)
ws_i.merge_range('B32:C32', 'MÁS HERRAMIENTAS GRATIS', f_hizq)
ws_i.write_url('C33', 'https://wealthuncut.com/herramientas/cuanto-ahorrar-al-mes/', F(font_color='#0563C1', underline=1), 'Cuánto ahorrar al mes (regla 50/30/20)')
ws_i.write_url('C34', 'https://wealthuncut.com/herramientas/calculadora-fondo-de-emergencia/', F(font_color='#0563C1', underline=1), 'Calculadora de fondo de emergencia')
ws_i.write_url('C35', 'https://wealthuncut.com/herramientas/calculadora-sueldo-neto/', F(font_color='#0563C1', underline=1), 'Calculadora de sueldo neto')
ws_i.write_url('C36', 'https://wealthuncut.com/plantilla-presupuesto/', F(font_color='#0563C1', underline=1), 'Guía de esta plantilla, con imágenes y vídeos')
ws_i.merge_range('B38:C39', 'Información educativa, no asesoramiento financiero. Plantilla creada por David Pérez Mitjà (WealthUncut), versión 1.0 de octubre de 2026. '
                 'Puedes usarla y modificarla para ti; no la vendas ni la presentes como tuya.', f_nota)
ws_i.set_landscape()
ws_i.fit_to_pages(1, 1)
ws_i.activate()
ws_i.set_first_sheet()

wb.close()
print('Plantilla creada en', RUTA)
