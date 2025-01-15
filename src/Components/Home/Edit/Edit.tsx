import React, { useState, useEffect } from 'react';
import '../Edit/Edit.css';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, onAuthStateChanged, getFirestore, getDocs, doc, setDoc, getDoc } from "../../../Services/FirebaseConfig";

const Edit: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Captura o parâmetro da URL
    const navigate = useNavigate();

    // Interface para o objeto Process
    interface Process {
        id?: string;
        processName: string;
        caseNumber: string;
        client: {
            photo: string;
            name: string;
            cpf: string;
            rg: string;
            email: string;
            phone: string;
            address: string;
        };
        area: string;
        protocolStatus: string;
        protocolDate: string;
        procuração: string;
        contrato: string;
    }

    const [process, setProcess] = useState<Process | null>(null);

    // Função para obter o processo do Firestore
    const getProcess = async () => {
        try {
            const docRef = doc(getFirestore(), "processes", id!);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProcess(docSnap.data() as Process);
            } else {
                console.error("No such document!");
            }
        } catch (error) {
            console.error("Erro ao obter processo:", error);
        }
    };

    // Função para salvar o processo atualizado
    const saveProcess = async () => {
        try {
            const docRef = doc(getFirestore(), "processes", id!);
            await setDoc(docRef, process);
            console.log("Processo atualizado com sucesso!");
            navigate("/"); // Volta para a página Home após salvar
        } catch (error) {
            console.error("Erro ao salvar processo:", error);
        }
    };

    useEffect(() => {
        // Verifica se o usuário está autenticado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Redireciona para a página de login se o usuário não estiver autenticado
                navigate("/");
            } else {
                getProcess(); // Obtém o processo se o usuário estiver autenticado
            }
        });

        // Cleanup da inscrição no listener
        return () => unsubscribe();
    }, [navigate, id]);

    return (
        <div>
            <h1>Editar Processo</h1>
            {process && (
                <div className="edit-container">
                    <div className="client-info">
                        <h3>Detalhes do Cliente</h3>
                        <img src={process.client.photo} alt="Foto do Cliente" style={{ width: '75px', height: '100px' }} />
                        <label>Nome:</label>
                        <input type="text" value={process.client.name} onChange={(e) => setProcess({ ...process, client: { ...process.client, name: e.target.value } })} />
                        <label>CPF:</label>
                        <input type="text" value={process.client.cpf} onChange={(e) => setProcess({ ...process, client: { ...process.client, cpf: e.target.value } })} />
                        <label>RG:</label>
                        <input type="text" value={process.client.rg} onChange={(e) => setProcess({ ...process, client: { ...process.client, rg: e.target.value } })} />
                        <label>E-mail:</label>
                        <input type="email" value={process.client.email} onChange={(e) => setProcess({ ...process, client: { ...process.client, email: e.target.value } })} />
                        <label>Telefone:</label>
                        <input type="text" value={process.client.phone} onChange={(e) => setProcess({ ...process, client: { ...process.client, phone: e.target.value } })} />
                        <label>Endereço:</label>
                        <input type="text" value={process.client.address} onChange={(e) => setProcess({ ...process, client: { ...process.client, address: e.target.value } })} />
                    </div>
                    <div className="process-info">
                        <h3>Informações do Processo</h3>
                        <label>Número do Processo:</label>
                        <input type="text" value={process.caseNumber} onChange={(e) => setProcess({ ...process, caseNumber: e.target.value })} />
                        <label>Data de Protocolo:</label>
                        <input type="text" value={process.protocolDate} onChange={(e) => setProcess({ ...process, protocolDate: e.target.value })} />
                        <label>Área:</label>
                        <input type="text" value={process.area} onChange={(e) => setProcess({ ...process, area: e.target.value })} />
                        <label>Status:</label>
                        <input type="text" value={process.protocolStatus} onChange={(e) => setProcess({ ...process, protocolStatus: e.target.value })} />
                        <label>Procuração:</label>
                        <input type="text" value={process.procuração} onChange={(e) => setProcess({ ...process, procuração: e.target.value })} />
                        <label>Contrato:</label>
                        <input type="text" value={process.contrato} onChange={(e) => setProcess({ ...process, contrato: e.target.value })} />
                    </div>
                    <button className="save-button" onClick={saveProcess}>Salvar</button>
                    <button className="back-button" onClick={() => navigate("/")}>Voltar para o Painel</button>
                </div>
            )}
        </div>
    );
};

export default Edit;
