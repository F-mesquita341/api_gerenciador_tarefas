const Usuario = require('../../src/domain/entities/Usuario');
const ValidacaoError = require('../../src/domain/errors/ValidacaoError');

describe('Entidade Usuario', () => {
  it('normaliza o e-mail para minúsculas e sem espaços', () => {
    const usuario = new Usuario({ nome: ' Ana ', email: '  ANA@Exemplo.COM ' });

    expect(usuario.nome).toBe('Ana');
    expect(usuario.email).toBe('ana@exemplo.com');
  });

  it('exige nome e e-mail', () => {
    expect(() => new Usuario({ email: 'ana@exemplo.com' })).toThrow(ValidacaoError);
    expect(() => new Usuario({ nome: 'Ana' })).toThrow(ValidacaoError);
  });

  it('rejeita e-mail em formato inválido', () => {
    expect(() => new Usuario({ nome: 'Ana', email: 'ana-arroba-exemplo' })).toThrow(ValidacaoError);
  });
});
