import { useState } from "react"
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from "react-hook-form"
import { api } from "../../services/api"
import { useToast } from "@/components/ui/use-toast"

type PasswordType = 'password' | 'text'

const loginFormSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(1, 'Digite sua senha'),
})

type LoginForm = z.infer<typeof loginFormSchema>

export function Login() {
  
  const [inputPasswordType, setInputPasswordType] = useState<PasswordType>('password')
  const handleTogglePassword = (type: PasswordType) => {
    switch (type) {
      case 'password':
        setInputPasswordType('text')
        return
        case 'text':
          default:
            setInputPasswordType('password')
            return
          }
        }

    const { toast } = useToast()

    const loginForm = useForm<LoginForm>({ 
      resolver: zodResolver(loginFormSchema)
    })

    const { register, handleSubmit, formState, reset } = loginForm

    const { errors } = formState

    const handleLoginSubmit = async (data: LoginForm) => {

    await api.post('/auth/login', data)
    .then(response => {
      toast({
        variant: "success",
        description: response.data.message,
      })
      
      if(response.data.token){

        const loggedUser = response.data.user;
        const token = response.data.token;

        localStorage.setItem("user", JSON.stringify(loggedUser));
        localStorage.setItem("token", JSON.stringify(token));

        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        setTimeout(() => {
          window.location.href = '/'
        }, 600)
      }
    })
    .catch(error => {
      toast({
        variant: "destructive",
        description: error.response.data.message,
      })
    })
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <form 
        onSubmit={handleSubmit(handleLoginSubmit)}
      >
        <Card className="w-full max-w-md p-6 md:p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Entre com suas credenciais para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" {...register('email')} placeholder="Digite seu email" />
              { errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p> }
            </div>
            <div className="space-y-3">
              <Label htmlFor="password">Senha</Label>
              <div className="relative flex items-center">
                <Input id="password" {...register('password')} type={inputPasswordType} placeholder="Digite sua senha" />
                <div
                  className="absolute right-3 text-gray-400 bg-none cursor-pointer"
                  onClick={() => handleTogglePassword(inputPasswordType)}
                >
                  { inputPasswordType === 'password' ? <EyeOff size={16} /> : <Eye size={16} /> }
                </div>
              </div>
              { errors.password && <p className="text-red-500 text-sm">{errors.password?.message}</p> }
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Entrar</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
