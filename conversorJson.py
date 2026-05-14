import pandas as pd
import json
import os

# ---------------------------------------------------------------------------
# CONVERSOR CLAVICULÁRIO → JSON para importação no sistema (index.html)
#
# O sistema espera um JSON que seja uma lista (Array) direta: [{...}, {...}]
# Qualquer campo que o sistema possui mas que não existe no Excel é exportado
# como null (None em Python → null em JSON).
# ---------------------------------------------------------------------------

def format_date(val):
    """Converte valor para string de data dd/mm/aaaa hh:mm:ss ou None se vazio."""
    if val is None:
        return None
    s = str(val).strip()
    if s in ("", "-", "nan", "0", "None", "00:00:00", "NaT"):
        return None
    try:
        return pd.to_datetime(val).strftime('%d/%m/%Y %H:%M:%S')
    except Exception:
        return s if s else None


def safe_str(val, fallback=None):
    """Converte para string limpa; retorna fallback se vazio/nulo."""
    if val is None:
        return fallback
    s = str(val).strip()
    if s in ("", "0", "nan", "None", "NaT"):
        return fallback
    return s


# ---------------------------------------------------------------------------
# CONFIGURAÇÃO DE CAMINHOS — ajuste conforme necessário
# ---------------------------------------------------------------------------
caminho_entrada = r'C:\Users\ext.rafael.sepulveda\Desktop\Clav Html\import\xlsm'
caminho_saida   = r'C:\Users\ext.rafael.sepulveda\Desktop\Clav Html\import\json'
arquivo_nome    = 'Claviculário - Gestão 12-05.xlsm'

os.makedirs(caminho_saida, exist_ok=True)
fullpath_entrada = os.path.join(caminho_entrada, arquivo_nome)

try:
    print(f"Lendo: {arquivo_nome}...")

    # -----------------------------------------------------------------------
    # 1. CHAVES  (aba: Consulta Endereço)
    #
    # Colunas do Excel  →  campo no sistema (tabela 'chaves')
    # Endereço da Posição → local_guardado
    # Placa               → placa / veiculo
    # Data de Entrada Pátio → data_status
    # Status Chave        → status
    # Chave Reserva       → reserva
    # responsavel         → null  (não existe no Excel)
    # foto_entrada        → null  (não existe no Excel)
    # -----------------------------------------------------------------------
    df_chaves = pd.read_excel(
        fullpath_entrada,
        sheet_name='Consulta Endereço',
        engine='openpyxl'
    )

    lista_chaves = []
    for _, row in df_chaves.iterrows():
        placa = safe_str(row.get('Placa'))
        if not placa:
            continue  # pula linhas sem placa

        lista_chaves.append({
            "placa":         placa,
            "veiculo":       placa,                                              # Excel não tem campo separado; usa a própria placa
            "local_guardado": safe_str(row.get('Endereço da Posição'), None),
            "reserva":       safe_str(row.get('Chave Reserva'), None),
            "status":        safe_str(row.get('Status Chave'), None),
            "responsavel":   None,                                               # não existe no Excel
            "data_status":   format_date(row.get('Data de Entrada Pátio')),
            "foto_entrada":  None,                                               # não existe no Excel
        })

    # O sistema espera um Array direto — NÃO envolva em {"chaves": [...]}
    with open(os.path.join(caminho_saida, 'import_chaves.json'), 'w', encoding='utf-8') as f:
        json.dump(lista_chaves, f, ensure_ascii=False, indent=2)

    print(f"  ✅ import_chaves.json → {len(lista_chaves)} registros")

    # -----------------------------------------------------------------------
    # 2. HISTÓRICO  (aba: Consulta Histórico)
    #
    # Colunas do Excel                          → campo no sistema (tabela 'historico')
    # Data do Registro                          → data_hora
    # Placa                                     → placa_retirada
    # Localização  (com espaço)                 → localizacao
    # Evento  (com espaço)                      → evento
    # Solicitante                               → nome_completo
    # Data Devolução  (com espaço)              → data_devolucao
    # Responsável pela Liberação  (com espaço)  → empresa
    # Status Devolução  (com espaço)            → status_devolucao
    # Chave Reserva - Cad./Mov./Saída Def.      → reserva
    # foto_evidencia                            → null  (não existe no Excel)
    # foto_devolucao                            → null  (não existe no Excel)
    # -----------------------------------------------------------------------
    df_hist = pd.read_excel(
        fullpath_entrada,
        sheet_name='Consulta Histórico',
        engine='openpyxl'
    )

    # Normaliza cabeçalhos (remove espaços extras para acesso seguro)
    df_hist.columns = [str(c).strip() for c in df_hist.columns]

    lista_hist = []
    for _, row in df_hist.iterrows():
        placa_hist = safe_str(row.get('Placa'))
        if not placa_hist:
            continue  # pula linhas sem placa

        lista_hist.append({
            "data_hora":       format_date(row.get('Data do Registro')),
            "placa_retirada":  placa_hist,
            "localizacao":     safe_str(row.get('Localização'), None),
            "evento":          safe_str(row.get('Evento'), None),
            "nome_completo":   safe_str(row.get('Solicitante'), None),
            "data_devolucao":  format_date(row.get('Data Devolução')),
            "empresa":         safe_str(row.get('Responsável pela Liberação'), None),
            "status_devolucao": safe_str(row.get('Status Devolução'), None),
            "reserva":         safe_str(row.get('Chave Reserva - Cad./Mov./Saída Def.'), None),
            "foto_evidencia":  None,   # não existe no Excel
            "foto_devolucao":  None,   # não existe no Excel
        })

    # O sistema espera um Array direto — NÃO envolva em {"historico": [...]}
    with open(os.path.join(caminho_saida, 'import_historico.json'), 'w', encoding='utf-8') as f:
        json.dump(lista_hist, f, ensure_ascii=False, indent=2)

    print(f"  ✅ import_historico.json → {len(lista_hist)} registros")
    print()
    print("Pronto! Importe os arquivos no sistema pelo menu 'Importar Chaves' / 'Importar Histórico'.")

except FileNotFoundError:
    print(f"❌ Arquivo não encontrado: {fullpath_entrada}")
    print("   Verifique se os caminhos 'caminho_entrada' e 'arquivo_nome' estão corretos.")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
    raise