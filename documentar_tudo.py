import os
from datetime import datetime

# Define a sintaxe de comentário para cada tipo de arquivo
CONFIG_LINGUAGENS = {
    '.css':  {'inicio': '/*',   'fim': '*/'},
    '.js':   {'inicio': '/*',   'fim': '*/'},
    '.ts':   {'inicio': '/*',   'fim': '*/'},
    '.html': {'inicio': '<!--', 'fim': '-->'},
    '.php':  {'inicio': '/*',   'fim': '*/'},
    '.py':   {'inicio': '"""',  'fim': '"""'},
    '.sql':  {'inicio': '-- ',  'fim': ''}
}

def gerar_cabecalho(nome_arquivo, extensao):
    data_atual = datetime.now().strftime("%d/%m/%Y")
    comentario = CONFIG_LINGUAGENS[extensao]
    
    # Monta o bloco de acordo com as tags da linguagem
    ini, fim = comentario['inicio'], comentario['fim']
    
    return f"""{ini} ==========================================================================
   ARQUIVO: {nome_arquivo}
   GERADO EM: {data_atual}
   ==========================================================================
   DOCUMENTAÇÃO PADRÃO DO PROJETO
   ========================================================================== {fim}

"""

def processar_projeto():
    # Pastas comuns que devemos ignorar para não estragar arquivos do sistema
    pastas_ignoradas = {'node_modules', '.git', '__pycache__', 'venv', 'dist', 'build'}
    
    for raiz, pastas, arquivos in os.walk('.'):
        # Filtra as pastas ignoradas
        pastas[:] = [p for p in pastas if p not in pastas_ignoradas]
        
        for arquivo in arquivos:
            nome_base, extensao = os.path.splitext(arquivo)
            extensao = extensao.lower()
            
            # Só mexe se o arquivo estiver na nossa lista de linguagens suportadas
            if extensao in CONFIG_LINGUAGENS and arquivo != 'documentar_tudo.py':
                caminho_completo = os.path.join(raiz, arquivo)
                
                try:
                    with open(caminho_completo, 'r', encoding='utf-8') as f:
                        conteudo_original = f.read()
                    
                    # Evita duplicar a documentação caso rode o script mais de uma vez
                    if "ARQUIVO:" in conteudo_original:
                        print(f"⚠️ Ignorado (já possui cabeçalho): {caminho_completo}")
                        continue
                    
                    # Junta o cabeçalho específico com o código antigo
                    novo_conteudo = gerar_cabecalho(arquivo, extensao) + conteudo_original
                    
                    with open(caminho_completo, 'w', encoding='utf-8') as f:
                        f.write(novo_conteudo)
                    
                    print(f"✅ Documentado com sucesso: {caminho_completo}")
                    
                except Exception as e:
                    print(f"❌ Erro ao processar {caminho_completo}: {e}")

if __name__ == "__main__":
    processar_projeto()