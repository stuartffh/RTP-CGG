# RTP-CGG

Aplicação Flask que exibe os dados de RTP de jogos em tempo real.

## Verificação SSL
Por padrão, as requisições HTTPS verificam o certificado do servidor. Para manter a segurança, **não desative** essa verificação em ambientes de produção.

Se for necessário desabilitar temporariamente:

```bash
VERIFY_SSL=false python app.py
# ou
python app.py --insecure
```

Utilize essa opção apenas em cenários de desenvolvimento ou testes.
