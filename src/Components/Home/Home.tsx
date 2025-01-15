import React, { useState, useEffect } from 'react';
import './Home.css';
import { Chart, registerables } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { auth, onAuthStateChanged, getFirestore, getDocs, collection, addDoc, deleteDoc, updateDoc, db, doc, setDoc } from "../../Services/FirebaseConfig"; // Importe doc e setDoc
import firebase from 'firebase/compat/app';

Chart.register(...registerables);

const Home: React.FC = () => {
    // buscando no banco de dados
   
    const navigate = useNavigate();
    
    // Interface para o objeto Process
    interface Process {
        id?: string; // Adicione o ID do Firestore
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

    // Estado para armazenar os processos
    const [processes, setProcesses] = useState<Process[]>([]); 
    const [selectedYear, setSelectedYear] = useState<string>("all");

    // Função para adicionar um novo processo
    const addProcess = async (newProcess: Process) => {
        try {
            newProcess.protocolStatus = 'pendente'; // Defina o status como pendente ao adicionar um novo processo
            const docRef = await addDoc(collection(db, "processes"), newProcess);
            console.log("Processo adicionado com ID:", docRef.id);
            // Atualize a lista de processos após adicionar um novo
            getProcesses(); // Chame a função para atualizar a lista
        } catch (error) {
            console.error("Erro ao adicionar processo:", error);
        }
    };
    
    // Função para obter processos do Firestore
    const getProcesses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "processes"));
            const processesData: Process[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as Process;
                processesData.push({ ...data, id: doc.id });
            });
            setProcesses(processesData); // Atualize o estado com os dados do Firestore
        } catch (error) {
            console.error("Erro ao obter processos:", error);
        }
    };
    
    // Função para atualizar um processo
    const updateProcess = async (processId: string, updatedProcess: Process) => {
        try {
            const docRef = doc(db, "processes", processId); // Use doc para obter a referência ao documento
            await setDoc(docRef, updatedProcess); // Use setDoc para atualizar o documento
            console.log("Processo atualizado com ID:", processId);
            // Atualize a lista de processos após atualizar
            getProcesses(); // Chame a função para atualizar a lista
        } catch (error) {
            console.error("Erro ao atualizar processo:", error);
        }
    };

    useEffect(() => {
        getProcesses();
    }, []);
    
    // Função para excluir um processo
    const deleteProcess = async (processId: string) => {
        try {
            const docRef = doc(db, "processes", processId); // Use doc para obter a referência ao documento
            await deleteDoc(docRef);
            console.log("Processo excluído com ID:", processId);
            // Atualize a lista de processos após excluir
            getProcesses(); // Chame a função para atualizar a lista
        } catch (error) {
            console.error("Erro ao excluir processo:", error);
        }
    };
    // Adicione mais processos conforme necessário
    

    const [selectedProcess, setSelectedProcess] = useState<any>(null);
    const [filteredProcesses, setFilteredProcesses] = useState(processes);
    const [chartFilters, setChartFilters] = useState({ type: "all" });
    const [searchTerm, setSearchTerm] = useState("");
    const [newProcess, setNewProcess] = useState<Process>({ // Estado para o novo processo
        processName: '',
        caseNumber: '',
        client: {
            photo: '',
            name: '',
            cpf: '',
            rg: '',
            email: '',
            phone: '',
            address: '',
        },
        area: '',
        protocolStatus: '',
        protocolDate: '',
        procuração: '',
        contrato: '',
    });
    const [updatedProcess, setUpdatedProcess] = useState<Process>({ // Estado para o processo atualizado
        processName: '',
        caseNumber: '',
        client: {
            photo: '',
            name: '',
            cpf: '',
            rg: '',
            email: '',
            phone: '',
            address: '',
        },
        area: '',
        protocolStatus: '',
        protocolDate: '',
        procuração: '',
        contrato: '',
    });

    // Função para exibir os detalhes do cliente
    const showClientDetails = (process: any) => {
        setSelectedProcess(process);
    };

    // Função para restaurar o gráfico
    const restoreChart = () => {
        setSelectedProcess(null);
    };

    // Função para filtrar os processos
    const updateProcessList = (protocolFilter: string, areaFilter: string) => {
        const filtered = processes.filter(process => {
            const matchesProtocol = protocolFilter === "all" || (process.protocolStatus || "pendente") === protocolFilter;
            const matchesArea = areaFilter === "all" || process.area === areaFilter;
            const matchesSearch = process.processName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesProtocol && matchesArea && matchesSearch;
        });
        setFilteredProcesses(filtered);
    };

    // Função para filtrar os processos para o gráfico
    const updateChartFilters = (typeFilter: string) => {
        setChartFilters({ type: typeFilter });
    };

    // Efeito para atualizar a lista de processos quando os filtros mudam
    useEffect(() => {
        updateProcessList("all", "all");
    }, [processes, searchTerm]);

    const filteredChartProcesses = processes.filter(process => {
        const matchesType = chartFilters.type === "all" || process.area === chartFilters.type;
        const matchesYear = selectedYear === "all" || new Date(process.protocolDate.split('/').reverse().join('-')).getFullYear().toString() === selectedYear;
        return matchesType && matchesYear;
    });

    useEffect(() => {
        // Verifica se o usuário está autenticado
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            // Redireciona para a página de login se o usuário não estiver autenticado
            navigate("/");
          }
        });
    
        // Cleanup da inscrição no listener
        return () => unsubscribe();
      }, [navigate]);

    const getYears = () => {
        const years = new Set<string>();
        processes.forEach(process => {
            const year = new Date(process.protocolDate.split('/').reverse().join('-')).getFullYear().toString();
            years.add(year);
        });
        return Array.from(years).sort();
    };

    const getProcessesPerYear = (processes: any[]) => {
        const years = getYears();
        const yearCounts = years.map(year => {
            return processes.filter(process => new Date(process.protocolDate.split('/').reverse().join('-')).getFullYear().toString() === year).length;
        });
        return yearCounts;
    };

    return (
        <div>
            <h1>Painel de Processos</h1>
            <div className="container">
                <div className="left-panel">
                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Pesquisar processo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="add-process-button" onClick={() => addProcess(newProcess)}>Adicionar Processo</button>
                    </div>
                    <div className="filters">
                        <select id="protocol-filter" onChange={(e) => updateProcessList(e.target.value, "all")}>
                            <option value="all">Todos os Status de Protocolo</option>
                            <option value="protocolado">Protocolados</option>
                            <option value="pendente">Pendentes</option>
                        </select>
                        <select id="area-filter" onChange={(e) => updateProcessList("all", e.target.value)}>
                            <option value="all">Todas as Áreas</option>
                            <option value="Direito Penal">Direito Penal</option>
                            <option value="Direito Civil">Direito Civil</option>
                            <option value="Direito Trabalhista">Direito Trabalhista</option>
                        </select>
                    </div>
                    <ul id="process-list">
                        {filteredProcesses.map(process => (
                            <li key={process.id} onClick={() => showClientDetails(process)}>
                                <img src={process.client.photo} alt="Foto do Cliente" style={{ borderRadius: '50%', width: '30px', height: '30px' }} />
                                {process.processName} - Nº {process.caseNumber}
                                <span className={`status-indicator ${(process.protocolStatus || 'pendente') === 'pendente' ? 'pendente' : 'protocolado'}`}></span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="right-panel">
                    {selectedProcess ? (
                        <div id="client-details">
                            <div className="client-info">
                                <h3>Detalhes do Cliente</h3>
                                <img src={selectedProcess.client.photo} alt="Foto do Cliente" style={{ width: '75px', height: '100px' }} />
                                <p><strong>Nome:</strong> {selectedProcess.client.name}</p>
                                <p><strong>CPF:</strong> {selectedProcess.client.cpf}</p>
                                <p><strong>RG:</strong> {selectedProcess.client.rg}</p>
                                <p><strong>E-mail:</strong> {selectedProcess.client.email}</p>
                                <p><strong>Telefone:</strong> {selectedProcess.client.phone}</p>
                                <p><strong>Endereço:</strong> {selectedProcess.client.address}</p>
                                <button className="edit-button" onClick={() => navigate(`./edit/${selectedProcess.id}`)}>Editar</button>
                            </div>
                            <div className="process-info">
                                <h3>Informações do Processo</h3>
                                <p><strong>Número do Processo:</strong> {selectedProcess.caseNumber} <span className={`status-indicator ${(selectedProcess.protocolStatus || 'pendente') === 'pendente' ? 'pendente' : 'protocolado'}`}></span></p>
                                <p><strong>Data de Protocolo:</strong> {selectedProcess.protocolDate}</p>
                                <p><strong>Procuração:</strong> <a href={selectedProcess.procuração} download>Baixar Procuração</a></p>
                                <p><strong>Contrato:</strong> <a href={selectedProcess.contrato} download>Baixar Contrato</a></p>
                            </div>
                            <button onClick={restoreChart} style={{ display: 'block', marginBottom: '10px', background: '#00ffff', border: 'none', borderRadius: '5px', padding: '10px', color: '#000', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s ease' }}>
                                Voltar Para Gráficos
                            </button>
                        </div>
                    ) : (
                        <div className="top-charts">
                            <div className="arc-chart-container">
                                <Doughnut data={{
                                    labels: ['Protocolados', 'Pendentes'],
                                    datasets: [{
                                        data: [calculateProtocolPercentage(processes), 100 - calculateProtocolPercentage(processes)],
                                        backgroundColor: ['#00ffff', 'rgba(255, 255, 255, 0.2)'],
                                        borderWidth: 0,
                                    }]
                                }} options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                        tooltip: {
                                            enabled: false,
                                        },
                                    },
                                }} />
                            </div>
                            <div className="pending-processes-container">
                                <h3>Processos Pendentes</h3>
                                <p id="pending-count">{countPendingProcesses(processes)}</p>
                            </div>
                        </div>
                    )}
                    {!selectedProcess && (
                        <div id="chart-container">
                            <div className="filter">
                                <select id="process-type-filter" onChange={(e) => updateChartFilters(e.target.value)}>
                                    <option value="all">Todos os Tipos</option>
                                    <option value="Direito Penal">Direito Penal</option>
                                    <option value="Direito Civil">Direito Civil</option>
                                    <option value="Direito Trabalhista">Direito Trabalhista</option>
                                </select>
                            </div>
                            <div className="filter">
                                <select id="year-filter" onChange={(e) => setSelectedYear(e.target.value)}>
                                    <option value="all">Todos os Anos</option>
                                    {getYears().map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="monthly-processes-container" style={{ marginTop: '20px', height: '400px' }}>
                                <Bar data={{
                                    labels: selectedYear === "all" ? getYears() : getMonths(),
                                    datasets: [{
                                        label: selectedYear === "all" ? 'Processos por Ano' : 'Processos por Mês',
                                        data: selectedYear === "all" ? getProcessesPerYear(filteredChartProcesses) : getProcessesPerMonth(filteredChartProcesses),
                                        backgroundColor: '#00ffff',
                                    }]
                                }} options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    maintainAspectRatio: false,
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Funções auxiliares
const calculateProtocolPercentage = (processes: any[]) => {
    const totalProcesses = processes.length;
    const protocoledProcesses = processes.filter((process: { protocolStatus: string }) => process.protocolStatus === "protocolado").length;
    return totalProcesses ? (protocoledProcesses / totalProcesses) * 100 : 0;
};

const countPendingProcesses = (processes: any[]) => {
    return processes.filter((process: { protocolStatus: string }) => (process.protocolStatus || 'pendente') === 'pendente').length;
};

const updateChart = () => {
    // Implementar lógica para atualizar o gráfico com base nos filtros
};

const getMonths = () => {
    return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
};

const getProcessesPerMonth = (processes: any[]) => {
    const months = Array(12).fill(0);
    processes.forEach(process => {
        const month = new Date(process.protocolDate.split('/').reverse().join('-')).getMonth();
        months[month]++;
    });
    return months;
};

export default Home;
