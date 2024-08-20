import { useState, useEffect, useContext } from "react";

import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelheader";
import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConection";
import { deleteObject, ref } from "firebase/storage";
import { AuthContext } from "../../contexts/AuthContext";

import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";



//=================================================================

interface CarProps{
    id: string;
    name: string;
    price: string | number;
    year: string;
    city: string;
    km: string;
    images:ImageCarProps[];
    uid: string;
}

interface ImageCarProps{
    name: string;
    uid: string;
    url: string;
}


export function Dashboard() {
    const {user} = useContext(AuthContext)
    const [cars, setCars] = useState<CarProps[]>([])


    useEffect(() => {
        function loadCars(){
            if(!user?.uid){
                return;
            }
            const carsRef = collection(db, "cars")
            const queryRef = query(carsRef, where("uid", "==", user.uid))

            getDocs(queryRef)
            .then((snapshot) =>{
                const listcars = [] as CarProps[];

                snapshot.forEach((doc) => {
                    listcars.push({
                        id: doc.id,
                        name:doc.data().name,
                        year:doc.data().year,
                        km:doc.data().km,
                        city:doc.data().city,
                        price:doc.data().price,
                        images: doc.data().image,
                        uid:doc.data().uid
                    })
                })

                setCars(listcars)
                console.log(listcars)
            })
            .catch((error) => {
                console.log(error)
                console.log("Erro ao carregar itens")
            })

        }

        loadCars();

    }, [user])

//===================================================================


    async function handleDeleteCar(car: CarProps){
        const itemCar = car;

        const docRef = doc(db, "cars", itemCar.id)
        await deleteDoc(docRef)

        itemCar.images.map( async (Image) => { 
            const imagePath = `images/${Image.uid}/${Image.name}`

            const imageRef = ref(storage, imagePath)
            
            try{
                await deleteObject(imageRef)
                setCars(cars.filter(car => car.id !== itemCar.id))
                toast.success("deletado com sucesso")
            }catch(error){
                console.log("Erro ao ecluir essa imagem")
            }
        })

        
    }


    return(
        <Container>
            <DashboardHeader/>

            <main className="grid grid-cols-1 gap gap6 md:grid-cols-2 lg:grid-cols-3">
                
            {cars.map((car) => (
                <section key={car.id} className="w-full bg-white rounded-lg relative p-4">

                <button 
                onClick={() => handleDeleteCar(car)}
                className="absolute bg-zinc-100 w-11 h-11 rounded-full flex items-center justify-center right-2 top-2 drop-shadow hover:scale-90 transition-all"
                >
                    <FiTrash2 size={26} color="black" />
                </button>

                <img
                    className="w-full rounded-lg mb-2 max-h-70"
                    src={car.images[0].url}
                />

                <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

                <div className="flex flex-col px-2">
                    <span className=" text-zinc-700">
                        Ano: {car.year} |  {car.km} km
                    </span>

                    <strong className="text-black font-bold mb-2 mt-4">
                        R$ {car.price}
                    </strong>                        
                </div>

                <div className="w-full h-px bg-slate-200 my-2"></div>
                <div className="px-2 pb-2">
                    <span className="text-black">
                        {car.city}
                    </span>
                </div>

            </section>
            ))}

            </main>

        </Container>
    )
}