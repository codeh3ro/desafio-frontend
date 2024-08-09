//@ts-nocheck
import { useState, useMemo, useEffect, useContext } from "react"
import { Link } from 'react-router-dom'
import { api } from "@/services/api"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Card, CardFooter, CardContent,CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import {  
    FilePenIcon, 
    TrashIcon, 
    MountainIcon
} from "lucide-react"
import Swal from 'sweetalert2'
import { AuthContext } from '../../contexts/auth';

export function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  console.log(user);

  const { toast } = useToast()

  const [cars, setCars] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("brand")
  const [sortDirection, setSortDirection] = useState("asc")
  const [showModal, setShowModal] = useState(false)
  const [currentCar, setCurrentCar] = useState(null)

  const filteredCars = useMemo(() => {
    return cars
      .filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
  }, [cars, searchTerm, sortColumn, sortDirection])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem)

  useEffect(() => {
    getCars()
  }, [])

  const getCars = async () => {
    api.get("/cars").then((response) => {
      setCars(response.data)
    })
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleCreateCar = () => {
    setCurrentCar(null)
    setShowModal(true)
  }

  const handleEditCar = (car) => {
    setCurrentCar(car)
    setShowModal(true)
  }

  const handleDeleteCar = (id) => {

    Swal.fire({
        title: "Deseja confirmar a exclusão desse cadastro?",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: `Cancelar`,
        confirmButtonColor: "#CF0000"
      }).then((result) => {

        if (result.isConfirmed) {
            api.delete(`/cars/${id}`)
            .then((response) => {
              getCars()
              toast({
                variant: "success",
                description: "Carro excluído com sucesso",
              })
            })
            .catch((error) => {
              toast({
                variant: "destructive",
                description: error.response.data.message,
              })
            })
        }
      });
  }

  const handleSaveChanges = (car) => {
    
    if (currentCar){
        api.put(`/cars/${currentCar.id}`, car)
        .then((response) => {
            getCars()
        
            toast({
            variant: "success",
            description: "Cadastro atualizado com sucesso",
            })
        })
        .catch((error) => {
            toast({
            variant: "destructive",
            description: error.response.data.message,
            })
        })
    } else {
        api.post("/cars", car)
        .then((response) => {
            getCars()
        
            toast({
            variant: "success",
            description: "Cadastro realizado com sucesso",
            })
        })
    }
    setShowModal(false)
  }
  return (
    <div className="min-h-screen bg-blue-50">
        <header className="bg-[#1e293b] px-4 py-3 mb-5 flex items-center justify-between">
            <Link href="#" className="flex items-center gap-2 text-white" prefetch={false}>
                <MountainIcon className="h-6 w-6" />
                <span className="text-lg font-semibold">Empresa</span>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-white">
                    <Avatar className="h-8 w-8">
                    <AvatarImage src="#" />
                    <AvatarFallback className="text-black">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Link href="#" className="flex items-center gap-2" prefetch={false}>
                    <div className="h-4 w-4" />
                    <span className="font-bold pr-5">Meu Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link onClick={logout} className="flex items-center w-full">
                    <div className="h-4 w-8" />
                    <span>Logout</span>
                    </Link>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>

        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Gestão de vendas de carros</h1>
            <Button onClick={handleCreateCar}>Novo Carro</Button>
          </div>
          <div className="flex items-center mb-4">
            <Input
              type="text"
              placeholder="Pesquisar carro por Marca ou Modelo.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 mr-4"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Ordenar por {sortColumn} {sortDirection === "asc" ? "\u2191" : "\u2193"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortColumn} onValueChange={(value) => setSortColumn(value)}>
                  <DropdownMenuRadioItem value="brand">Marca</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="model">Modelo</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="color">Cor</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price">Preço</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>            
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filteredCars.length === 0 ? <Card><CardContent><CardDescription className="pt-6 text-center">Nenhum carro encontrado</CardDescription></CardContent></Card> : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        width={100}
                        height={100}
                        className="rounded-md"
                        style={{ aspectRatio: "100/100", objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell>{car.brand}</TableCell>
                    <TableCell>{car.model}</TableCell>
                    <TableCell>{car.color}</TableCell>
                    <TableCell>{car.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => {
                                    handleEditCar(car)
                                    console.log(currentCar)
                                }
                            }>
                            <FilePenIcon className="h-4 w-4" />
                          </Button>
                          <Button className="bg-red-600" size="icon" onClick={() => handleDeleteCar(car.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CardFooter>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredCars.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </CardFooter>
          </Card>
            )}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{currentCar ? "Editar Carro" : "Novo Carro"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="marca" className="text-right">
                    Marca
                  </Label>
                  <Input id="marca" defaultValue={currentCar?.brand} className="col-span-3" />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="modelo" className="text-right">
                    Modelo
                  </Label>
                  <Input id="modelo" defaultValue={currentCar?.model} className="col-span-3" />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="cor" className="text-right">
                    Cor
                  </Label>
                  <Input id="cor" type="text" defaultValue={currentCar?.color} className="col-span-3" />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="preco" className="text-right">
                    Preço
                  </Label>
                  <Input id="preco" type="number" defaultValue={currentCar?.price} className="col-span-3" />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="image" className="text-right">
                    Imagem
                  </Label>
                  <Input id="imagem" type="text" defaultValue={currentCar?.imageUrl} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() =>
                    handleSaveChanges({
                      brand: document.getElementById("marca").value,
                      model: document.getElementById("modelo").value,
                      color: document.getElementById("cor").value,
                      price: parseFloat(document.getElementById("preco").value),
                      imageUrl: document.getElementById("imagem").value,
                    })
                  }
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  )
}