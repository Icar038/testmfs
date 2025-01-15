import {FaUser, FaLock} from "react-icons/fa";
import './Register.css';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../Services/FirebaseConfig";
import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
<script src="https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"></script>

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMensagem, setErrorMensagem] = useState<string>('');
  const navigate = useNavigate();

  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

  useEffect(() => {
      console.log('Erro:', errorMensagem);
    }, [errorMensagem]);
  
    useEffect(() => {
      if (error) {
        setErrorMensagem('Conta ja cadastrado');
      }
    }, [error]);

  function handleSignOut(e: React.FormEvent) {
      e.preventDefault();
      createUserWithEmailAndPassword(email, password)
        .then(() => {
          // Autenticação bem-sucedida
        })
        .catch((error) => {
          console.log('Erro:', error);
        });
    }

  //oque aparece quando
  if(loading) {
    return <p>Carregando...</p>
  }
  if (user) {
    navigate('/Home');
    return null;
  }
  
  
  return (
    <div>
      <div className="register-container">
        <form>
        {errorMensagem && (
            <p style={{ color: 'red' }}>{errorMensagem}</p>
          )}
            <h1> Cadastrar </h1>
            <div>
            <input 
            type="email" 
            name="email"
            id="email"
            placeholder="Digite Seu E-mail" 
            onChange={(e) => setEmail(e.target.value)}/>
            <FaUser className="icon" />
            </div>
            <div> 
            <input 
            type="password"
            name="password"
            id="password"
            placeholder='Digite Sua Senha'/>
            <FaLock className="icon" />
            </div>
            <div> 
            <input 
            type="password"
            name="password"
            id="password"
            placeholder='Confirme Sua Senha'
            onChange={(e) => setPassword (e.target.value)}/>
            <FaLock className="icon" />
            </div>

            <button
               className="button" onClick={handleSignOut}>Cadastrar
            </button>

        </form>
      </div>
    </div>
  )
}
export default Register;