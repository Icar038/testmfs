import './Form.css';
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxConfig from '../../Services/MapboxConfig';
import '../../Services/verificacaofacialConfig/tracking-min.js';
import '../../Services/verificacaofacialConfig/data/face-min.js';
import 'tracking/build/data/face';

mapboxgl.accessToken = MapboxConfig.accessToken;

const Form: React.FC = () => {
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<string>('secao-informacoes-pessoais');

  useEffect(() => {
    if (!geocoderContainerRef.current) return;

    if (geocoderContainerRef.current.childElementCount === 0) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken || '',
        placeholder: 'Digite um endereço...',
        types: 'address',
        countries: 'br',
      });

      geocoder.addTo(geocoderContainerRef.current);

      geocoder.on('result', (e) => {
        setAddress(e.result.place_name);
      });

      geocoder.on('clear', () => {
        setAddress('');
      });

      return () => {
        geocoder.onRemove();
      };
    }
  }, []);

  const handleNextStep = (nextSection: string) => {
    setCurrentSection(nextSection);
  };

  // Funções de validação
  const validarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Cálculo do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * (10 - i);
    }
    let primeiroDigito = (soma * 10) % 11;
    if (primeiroDigito === 10 || primeiroDigito === 11) {
      primeiroDigito = 0;
    }

    // Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * (11 - i);
    }
    let segundoDigito = (soma * 10) % 11;
    if (segundoDigito === 10 || segundoDigito === 11) {
      segundoDigito = 0;
    }

    // Verifica se os dígitos verificadores estão corretos
    return primeiroDigito === parseInt(cpf[9]) && segundoDigito === parseInt(cpf[10]);
  };

  const validarRG = (rg: string) => {
    return rg.length >= 5 && /^\d+$/.test(rg);
  };

  const validarEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const apenasNumeros = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
  };

  const formatarTelefone = (telefone: string) => {
    return telefone.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length > 11) {
      cpf = cpf.substring(0, 11); // Limita o CPF a 11 dígitos
    }
    return cpf.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{2})$/, '$1-$2');
  };

  useEffect(() => {
    const cpfInput = document.getElementById('cpf') as HTMLInputElement;
    const telefoneInput = document.getElementById('telefone') as HTMLInputElement;
    const rgInput = document.getElementById('rg') as HTMLInputElement;
  
    const handleCpfInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      input.value = input.value.replace(/\D/g, '');
      input.value = formatarCPF(input.value);
    };
  
    const handleTelefoneInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      input.value = input.value.replace(/\D/g, '');
      input.value = formatarTelefone(input.value);
    };
  
    const handleRgInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      input.value = input.value.replace(/\D/g, '');
    };
  
    cpfInput.addEventListener('input', handleCpfInput);
    telefoneInput.addEventListener('input', handleTelefoneInput);
    rgInput.addEventListener('input', handleRgInput);
  
    return () => {
      cpfInput.removeEventListener('input', handleCpfInput);
      telefoneInput.removeEventListener('input', handleTelefoneInput);
      rgInput.removeEventListener('input', handleRgInput);
    };
  }, []);

  useEffect(() => {
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const message = document.getElementById('message') as HTMLParagraphElement;

    const handleImageUpload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file && context) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const img = new Image();

          img.onload = () => {
            // Dimensões originais da imagem
            const originalWidth = img.width;
            const originalHeight = img.height;

            // Ajusta a imagem para caber no canvas
            const scaleWidth = canvas.width / originalWidth;
            const scaleHeight = canvas.height / originalHeight;
            const scale = Math.min(scaleWidth, scaleHeight);
            const x = (canvas.width - originalWidth * scale) / 2;
            const y = (canvas.height - originalHeight * scale) / 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, x, y, originalWidth * scale, originalHeight * scale);

            // Criar um canvas invisível para processar a imagem na escala original
            const hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = originalWidth;
            hiddenCanvas.height = originalHeight;
            const hiddenContext = hiddenCanvas.getContext('2d');
            if (hiddenContext) {
              hiddenContext.drawImage(img, 0, 0);

              const tracker = new tracking.ObjectTracker('face');
              tracker.setInitialScale(4);
              tracker.setStepSize(1.5);
              tracker.setEdgesDensity(0.1);

              tracker.on('track', (event) => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, x, y, originalWidth * scale, originalHeight * scale);

                if (event.data.length === 0) {
                  message.textContent = 'Nenhum rosto detectado na imagem.';
                } else if (event.data.length > 1) {
                  message.textContent = 'Mais de um rosto detectado na imagem.';
                } else {
                  message.textContent = '';
                  const rect = event.data[0];

                  // Ajustar coordenadas do retângulo para o canvas visível
                  const rectX = x + rect.x * scale;
                  const rectY = y + rect.y * scale;
                  const rectWidth = rect.width * scale;
                  const rectHeight = rect.height * scale;

                  context.strokeStyle = '#00ff1e';
                  context.lineWidth = 2;

                  // Desenhar apenas os vértices
                  const cornerSize = 15; // Tamanho das linhas do vértice

                  // Canto superior esquerdo
                  context.beginPath();
                  context.moveTo(rectX, rectY);
                  context.lineTo(rectX + cornerSize, rectY);
                  context.moveTo(rectX, rectY);
                  context.lineTo(rectX, rectY + cornerSize);
                  context.stroke();

                  // Canto superior direito
                  context.beginPath();
                  context.moveTo(rectX + rectWidth, rectY);
                  context.lineTo(rectX + rectWidth - cornerSize, rectY);
                  context.moveTo(rectX + rectWidth, rectY);
                  context.lineTo(rectX + rectWidth, rectY + cornerSize);
                  context.stroke();

                  // Canto inferior esquerdo
                  context.beginPath();
                  context.moveTo(rectX, rectY + rectHeight);
                  context.lineTo(rectX + cornerSize, rectY + rectHeight);
                  context.moveTo(rectX, rectY + rectHeight);
                  context.lineTo(rectX, rectY + rectHeight - cornerSize);
                  context.stroke();

                  // Canto inferior direito
                  context.beginPath();
                  context.moveTo(rectX + rectWidth, rectY + rectHeight);
                  context.lineTo(rectX + rectWidth - cornerSize, rectY + rectHeight);
                  context.moveTo(rectX + rectWidth, rectY + rectHeight);
                  context.lineTo(rectX + rectWidth, rectY + rectHeight - cornerSize);
                  context.stroke();
                }
              });

              tracking.track(hiddenCanvas, tracker);
            }
          };

          img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      }
    };

    imageUpload.addEventListener('change', handleImageUpload);

    return () => {
      imageUpload.removeEventListener('change', handleImageUpload);
    };
  }, []);

  return (
    <div className="form-container">
      <form id="secao-informacoes-pessoais" style={{ display: currentSection === 'secao-informacoes-pessoais' ? 'block' : 'none' }}>
        <div id="barra-progresso">
          <div className="bolinha ativo">1</div>
          <div className="linha"></div>
          <div className="bolinha">2</div>
          <div className="linha"></div>
          <div className="bolinha">3</div>
        </div>
        <h1>Bem-vindo ao Formulario</h1>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo:</label>
          <input type="text" id="nome" name="data[nome]" required placeholder="Digite seu Nome Completo" />
          <div id="nome-erro"></div>
        </div>
        <div className="form-group">
          <input type="email" name="email" id="email" placeholder="Digite Seu E-mail" required />
        </div>
        <div className="form-group">
          <label htmlFor="data-nascimento">Data de Nascimento:</label>
          <input type="date" id="data-nascimento" name="data[data-nascimento]" required />
          <div id="data-nascimento-erro"></div>
        </div>
        <div className="form-group">
          <label htmlFor="nacionalidade">Nacionalidade:</label>
          <select id="nacionalidade" name="data[nacionalidade]" required>
            <option value="Brasileiro(a)" selected>Brasileiro(a)</option>
            <option value="Afeganistão">Afeganistão</option>
            <option value="África do Sul">África do Sul</option>
            <option value="Albânia">Albânia</option>
            <option value="Alemanha">Alemanha</option>
            <option value="Andorra">Andorra</option>
            <option value="Angola">Angola</option>
            <option value="Arábia Saudita">Arábia Saudita</option>
            <option value="Argentina">Argentina</option>
            <option value="Armênia">Armênia</option>
            <option value="Austrália">Austrália</option>
            <option value="Áustria">Áustria</option>
            <option value="Azerbaijão">Azerbaijão</option>
            <option value="Bahamas">Bahamas</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Barbados">Barbados</option>
            <option value="Bélgica">Bélgica</option>
            <option value="Belize">Belize</option>
            <option value="Benin">Benin</option>
            <option value="Bolívia">Bolívia</option>
            <option value="Botsuana">Botsuana</option>
            <option value="Brasil">Brasil</option>
            <option value="Brunei">Brunei</option>
            <option value="Bulgária">Bulgária</option>
            <option value="Burundi">Burundi</option>
            <option value="Butão">Butão</option>
            <option value="Cabo Verde">Cabo Verde</option>
            <option value="Camboja">Camboja</option>
            <option value="Catar">Catar</option>
            <option value="Canadá">Canadá</option>
            <option value="Chile">Chile</option>
            <option value="China">China</option>
            <option value="Chipre">Chipre</option>
            <option value="Colômbia">Colômbia</option>
            <option value="Coreia do Norte">Coreia do Norte</option>
            <option value="Coreia do Sul">Coreia do Sul</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Croácia">Croácia</option>
            <option value="Cuba">Cuba</option>
            <option value="Dinamarca">Dinamarca</option>
            <option value="Egito">Egito</option>
            <option value="Emirados Árabes Unidos">Emirados Árabes Unidos</option>
            <option value="Equador">Equador</option>
            <option value="Eslováquia">Eslováquia</option>
            <option value="Eslovênia">Eslovênia</option>
            <option value="Espanha">Espanha</option>
            <option value="Estados Unidos">Estados Unidos</option>
            <option value="Estônia">Estônia</option>
            <option value="Etiópia">Etiópia</option>
            <option value="Filipinas">Filipinas</option>
            <option value="Finlândia">Finlândia</option>
            <option value="França">França</option>
            <option value="Gabão">Gabão</option>
            <option value="Gana">Gana</option>
            <option value="Geórgia">Geórgia</option>
            <option value="Grécia">Grécia</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Guiana">Guiana</option>
            <option value="Guiné">Guiné</option>
            <option value="Haiti">Haiti</option>
            <option value="Holanda">Holanda</option>
            <option value="Honduras">Honduras</option>
            <option value="Hungria">Hungria</option>
            <option value="Índia">Índia</option>
            <option value="Indonésia">Indonésia</option>
            <option value="Inglaterra">Inglaterra</option>
            <option value="Irã">Irã</option>
            <option value="Iraque">Iraque</option>
            <option value="Irlanda">Irlanda</option>
            <option value="Islândia">Islândia</option>
            <option value="Israel">Israel</option>
            <option value="Itália">Itália</option>
            <option value="Jamaica">Jamaica</option>
            <option value="Japão">Japão</option>
            <option value="Jordânia">Jordânia</option>
            <option value="Letônia">Letônia</option>
            <option value="Líbano">Líbano</option>
            <option value="Líbia">Líbia</option>
            <option value="Lituânia">Lituânia</option>
            <option value="Luxemburgo">Luxemburgo</option>
            <option value="Malásia">Malásia</option>
            <option value="México">México</option>
            <option value="Moçambique">Moçambique</option>
            <option value="Namíbia">Namíbia</option>
            <option value="Noruega">Noruega</option>
            <option value="Nova Zelândia">Nova Zelândia</option>
            <option value="Paquistão">Paquistão</option>
            <option value="Paraguai">Paraguai</option>
            <option value="Peru">Peru</option>
            <option value="Portugal">Portugal</option>
            <option value="Quênia">Quênia</option>
            <option value="Reino Unido">Reino Unido</option>
            <option value="República Tcheca">República Tcheca</option>
            <option value="Rússia">Rússia</option>
            <option value="Suécia">Suécia</option>
            <option value="Suíça">Suíça</option>
            <option value="Uruguai">Uruguai</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Vietnã">Vietnã</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Número de Telefone:</label>
          <input type="text" id="telefone" name="data[telefone]" className="campo-pequeno" required placeholder="(00) 00000-0000" />
          <div id="telefone-erro"></div>
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input type="text" id="cpf" name="data[cpf]" className="campo-pequeno" required placeholder="Digite seu CPF" />
          <div id="cpf-erro"></div>
        </div>
        <div className="form-group">
          <label htmlFor="rg">RG:</label>
          <input type="text" id="rg" name="data[rg]" className="campo-pequeno" required placeholder="Digite seu RG" />
          <div id="rg-erro"></div>
        </div>
        <div className="form-group">
          <label htmlFor="estado-civil">Estado Civil:</label>
          <select id="estado-civil" name="data[estado-civil]" required>
            <option value="" disabled selected>Selecione seu estado civil</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="address">Endereço:</label>
          <div ref={geocoderContainerRef} className="geocoder-container"></div>
        </div>
        <input type="hidden" id="endereco-selecionado" name="data[endereco]" />
        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input type="email" id="email" name="data[email]" required placeholder="seuemail@exemplo.com.br" />
          <div id="email-erro"></div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmar-email">Confirmar E-mail:</label>
          <input type="email" id="confirmar-email" name="data[confirmar-email]" required placeholder="Confirme seu E-mail" />
          <div id="confirmar-email-erro"></div>
        </div>
        <div className="lista-selecao">
          <div className="item">
            <input type="checkbox" id="opcao1" name="data[advogado1]" value="VINMERSON DOS SANTOS FREITAS, brasileiro, maior, capaz, casado, advogado devidamente escrito a OAB/BA no 76.100" />
            <label htmlFor="opcao1">VINMERSON DOS SANTOS FREITAS</label>
          </div>
          <div className="item">
            <input type="checkbox" id="opcao2" name="data[advogado2]" value="SIDNEI DE FREITAS MARQUES, brasileiro, maior, capaz, casado, advogado devidamente escrito a OAB/BA no 71.278" />
            <label htmlFor="opcao2">SIDNEI DE FREITAS MARQUES</label>
          </div>
          <div className="item">
            <input type="checkbox" id="opcao3" name="data[advogado3]" value="RAFAELA NASCIMENTO DOS SANTOS, brasileira, maior, capaz, divorciada, advogado devidamente escrito a OAB/BA nº 75.803" />
            <label htmlFor="opcao3">RAFAELA NASCIMENTO DOS SANTOS</label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="foto-comprovante">Foto Do Comprovante De Residencia:</label>
          <input type="file" id="foto-comprovante" name="data[foto-comprovante]" accept="image/*" required />
        </div>
        <div className="form-group">
          <label htmlFor="foto-rg">Foto do RG:</label>
          <input type="file" id="foto-rg" name="data[foto-rg]" accept="image/*" required />
        </div>
        <input type="hidden" id="latitude" name="data[latitude]" />
        <input type="hidden" id="longitude" name="data[longitude]" />
        <input type="hidden" id="data-hora" name="data[data-hora]" />
        <button type="button" onClick={() => handleNextStep('secao-liveness-detection')}>Próxima Etapa</button>
      </form>
<form> 
      <div id="secao-liveness-detection" style={{ display: currentSection === 'secao-liveness-detection' ? 'block' : 'none' }}>
        <div id="barra-progresso">
          <div className="bolinha">1</div>
          <div className="linha"></div>
          <div className="bolinha ativo">2</div>
          <div className="linha"></div>
          <div className="bolinha">3</div>
        </div>
        <h2>Detecção Facial</h2>
        <div className="form-group">
          <p>Carregue uma imagem para verificar se um rosto é detectado.</p>
          <label className="upload-button" htmlFor="imageUpload">Carregar Imagem</label>
          <input type="file" name="data[foto_verificacao]" id="imageUpload" accept="image/*" />
          <canvas id="canvas" width="400" height="300"></canvas>
          <p id="message" className="message"></p>
        </div>
        <button type="button" onClick={() => handleNextStep('secao-termos-condicoes')}>Próxima Etapa</button>
      </div>
      </form>
      <form> 
      <div id="secao-termos-condicoes" style={{ display: currentSection === 'secao-termos-condicoes' ? 'block' : 'none' }}>
        <div id="barra-progresso">
          <div className="bolinha">1</div>
          <div className="linha"></div>
          <div className="bolinha">2</div>
          <div className="linha"></div>
          <div className="bolinha ativo">3</div>
        </div>
        <h2>Termos e Condições</h2>
        <div className="form-group">
          <p>Por favor, leia e aceite os termos e condições para continuar.</p>
          <textarea id="termos-condicoes" rows={10} cols={50} readOnly>
            PROCURAÇÃO 
            OUTORGADOS: VINMERSON DOS SANTOS FREITAS, brasileiro, maior, capaz, advogado
            devidamente inscrito a OAB/BA nº 76.100 , e SIDNEI DE FREITAS MARQUES , brasileiro,
            maior , capaz, casado, advoga do devidamente escrito a OAB/BA nº 71.278, todos com escritório
            profissional à Rua São Marcos, n° 73, 1º andar, São Marcos,Salvador/BA. CEP: 41.253-281.
            PODERES: conferindo-lhes plenos poderes para, agir em conjunto ou separadamente, com cláusula
            AD JUDICIA ET EXTRA, para lhe representar em juízo, com fins de propor/acompanhar, bem
            como, no contexto desta demanda transigir, fazer acordo, firmar compromisso, substabelecer,
            renunciar, desistir, reconhecer a procedência do pedido, receber notificações, receber valores e dar
            quitação, firmar declaração de hipossuficiência, praticar todos os atos perante repartições públicas
            Federais, Estaduais e Municipais, e órgãos da administração pública direta e indireta, praticar
            quaisquer atos perante particulares ou empresas privadas, recorrer a quaisquer instâncias, podendo
            atuar em conjunto ou separadamente, dando tudo por bom e valioso.
          </textarea>
          <label>
            <input type="checkbox" id="aceitar-termos" required /> Eu aceito os termos e condições
          </label>
        </div>
        <button id="finalizar-cadastro">Finalizar Cadastro</button>
      </div>
      </form>
    </div>
  );
};

export default Form;
