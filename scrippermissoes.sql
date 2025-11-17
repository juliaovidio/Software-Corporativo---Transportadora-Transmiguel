INSERT INTO cargo (tipo)
VALUES 
    ('Gerente'),
    ('Motorista'),
    ('Secretário');


INSERT INTO funcionarios 
(nome, telefone, cpf, email, senha, cargo_idCargo, tipo_CNH, validade_CNH, numero_CNH)
VALUES
('José Francisco Sartorio', '(35)99876-5432', '987.654.321-00', 'jose@gmail.com', SHA2('senha456', 256), 5, 'D', '2027-05-15', '1234567890'),
('Carlos Santos', '(35)99123-4567', '321.654.987-00', 'carlossantos@email.com', SHA2('senha789', 256), 5, 'E', '2026-11-30', '9876543210'),
('Ana Souza', '(35)99988-7766', '654.321.987-00', 'anasouza@email.com', SHA2('senha321', 256), 6, NULL, NULL, NULL),
('Pedro Lima', '(35)98877-6655', '111.222.333-44', 'pedrolima@email.com', SHA2('senha456', 256), 5, 'D', '2028-03-20', '1122334455'),
('João Silva Alemida', '(35)98765-4321', '123.456.789-00', 'joaosilva@gmail.com',  SHA2('senha123', 256), 4, NULL, NULL, NULL);

-- ----------------------------------------------------------------------------------------------------------------------------------
-- ve os usuarios e permissoes
select * from mysql.user;
select user as user_name
from mysql.user
-- com esse junto mostra so os usuarios
where host = '%' and authentication_string= '';

-- criar identificacao
CREATE ROLE 'gerente_transportadora';
CREATE ROLE 'secretario';
CREATE ROLE 'motorista';



-- Gerente: acesso total ao banco "banco_locomoção"
GRANT ALL PRIVILEGES ON `banco_locomoção`.* TO 'gerente_transportadora'@'%';

-- Secretário: pode SELECT, INSERT e UPDATE nas tabelas específicas
GRANT SELECT, INSERT, UPDATE ON `banco_locomoção`.passageiro TO 'secretario'@'%';
GRANT SELECT, INSERT, UPDATE ON `banco_locomoção`.rotas TO 'secretario'@'%';
GRANT SELECT, INSERT, UPDATE ON `banco_locomoção`.trajetos TO 'secretario'@'%';
GRANT SELECT, INSERT, UPDATE ON `banco_locomoção`.veiculos TO 'secretario'@'%';
GRANT SELECT, INSERT, UPDATE ON `banco_locomoção`.pagamento_passageiro TO 'secretario'@'%';

-- Motorista: apenas SELECT nos trajetos
GRANT SELECT ON `banco_locomoção`.trajetos TO 'motorista'@'%';

-- Aplicar alterações
FLUSH PRIVILEGES;


-- 1️⃣ Criar usuários no MySQL com base nos funcionários
CREATE USER 'joao silva'@'%' IDENTIFIED BY 'senha123';
CREATE USER 'jose francisco'@'%' IDENTIFIED BY 'senha456';
CREATE USER 'carlos santos'@'%' IDENTIFIED BY 'senha789';
CREATE USER 'ana souza '@'%' IDENTIFIED BY 'senha321';
CREATE USER 'pedro lima'@'%' IDENTIFIED BY 'senha456';

GRANT 'gerente_transportadora' TO 'joao silva'@'%';
GRANT 'secretario' TO 'ana souza'@'%';
GRANT 'motorista' TO 'jose francisco'@'%';
GRANT 'motorista' TO 'carlos santos'@'%';
GRANT 'motorista' TO  'pedro lima'@'%';
SET DEFAULT ROLE ALL TO 'joao silva' @'%','ana souza'@'%','jose francisco'@'%', 'carlos santos'@'%', 'pedro lima'@'%' ; 


