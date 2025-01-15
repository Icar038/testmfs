import {FaUser  , FaLock} from "react-icons/fa";
import './Login.css';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../Services/FirebaseConfig";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMensagem, setErrorMensagem] = useState<string>('');
  const navigate = useNavigate();


  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    console.log('Erro:', errorMensagem);
  }, [errorMensagem]);

  useEffect(() => {
    if (error) {
      setErrorMensagem('Email ou senha inválidos');
    }
  }, [error]);

  function handleSignOut(e: React.FormEvent) {
    e.preventDefault();
    signInWithEmailAndPassword(email, password)
      .then(() => {
        // Autenticação bem-sucedida
      })
      .catch((error) => {
        console.log('Erro:', error);
      });
  }

  if (loading) {
    return <p>Loading...</p>;
  }
  if (user) {
    navigate('./Home');
    return null;
  }

  return (
    <div>
      <div className="login-container">
        <div className="right-container">
          <img src="src\assets\principal.png" alt="Visual" />
        </div>
        <form>
        {errorMensagem && (
            <p style={{ color: 'red' }}>{errorMensagem}</p>
          )}
          <h1> Acesse o Sistema</h1>
          <div>
            <input 
              type="email" 
              value={email}
              name="email"
              id="email"
              placeholder="Digite Seu E-mail"
              onChange={(e) => setEmail(e.target.value)} />
            <FaUser   className="icon" />
          </div>
          <div> 
            <input 
              type="password"
              value={password}
              name="password"
              id="password"
              placeholder='Digite Sua Senha'
              onChange={(e) => setPassword (e.target.value)}
              />
            <FaLock className="icon" />
          </div>

          <div className="recall-forget">
            <label>
              <input type="checkbox" />
              Lembrar de mim?
            </label>
          </div>

          <button
            className="button" onClick={handleSignOut}>Entrar
          </button>

          <div className="signup-link">
            <p> Não tem uma conta ainda? 
              <a href="./Register">Registrar</a>
            </p>
          </div>
          
        </form>
      </div>
    </div>
  )
}

export default Login