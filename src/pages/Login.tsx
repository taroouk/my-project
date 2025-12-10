import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await signIn(email, password)

    if (error) {
      setMessage(error)
    } else {
      setMessage('')
      navigate('/dashboard') // نعمل redirect بعد الدخول
    }
  }

  return (
    <div className="login-form">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}

export default Login
