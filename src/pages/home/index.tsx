import { Container } from "../../components/container";
import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { db } from "../../services/firebaseConection";
import { Link } from "react-router-dom";




interface CarProps{
    id: string;
    name: string;
    year: string;
    uid: string;
    price: string | number;
    city: string;
    km: string;
    images: carImageProps[]
}

interface carImageProps{
    name: string;
    uid: string;
    url: string;
}

export function Home() {

    const [ cars, setCars ] = useState<CarProps[]>([])
    const [loadImages, setLoadImages] = useState<string[]>([])
    const [ input, setInput ] = useState("")

    useEffect(() => {
        loadCars();
    }, [])


    function loadCars(){
        const carsRef = collection(db, "cars")
        const queryRef = query(carsRef, orderBy("created", "desc"))

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
        })
        .catch((error) => {
            console.log(error)
            console.log("Erro ao carregar itens")
        })

    }


    function handleImageLoad(id: string) {
       setLoadImages((prevImagesLoad) => [...prevImagesLoad, id])
   }


   async function handleSearchCar(){
        if(input === ''){
            loadCars();
            return;
        }

        setCars([]);
        setLoadImages([]);

        const q = query(collection(db, "cars"), 
            where("name", ">=", input.toLocaleUpperCase()),
            where("name", "<=", input.toLocaleUpperCase() + "\uf8ff")
        )

        const querySnapshot = await getDocs(q)

        const listcarros = [] as CarProps[];

        querySnapshot.forEach((doc) => {
            listcarros.push({
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

        setCars(listcarros) 
   }


    return(
        <Container>
            <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
                <input
                    className="w-full border-2 rounded-lg h-9 px-3 outline-none"
                    placeholder="Digite o nome do carro."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <button 
                    className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg hover:scale-105 transition-all"
                    onClick={handleSearchCar}
                    >
                    Buscar
                </button>
            </section>

            <h1 className="font-bold text-center mt-6 text-2xl mb-4">
                Carros novos e usados em todo Brasil
            </h1>

            <main className="grid grid-cols-1 pag-6 md:grid-cols-2 lg:grid-cols-3">
                
            
            
            {cars.map((car) => (
                <Link key={car.id} to={`/car/${car.id}`}>
                    <section className="w-full bg-white rounded-lg p-5">

                        <div 
                            className="w-full reunded-lg h-72 rounded-lg bg-slate-200"
                            style={{ display: loadImages.includes(car.id) ? "none" : "block"}}
                        
                        >

                        </div>

                        <img
                            className="w-full rounded-lg mb-2 max-h-82 hover:scale-105 transition-all"
                            src={car.images[0].url}
                            alt="Carro"
                            onLoad={() => handleImageLoad(car.id)}
                            style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
                        />

                        <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

                        <div className="flex flex-col px-2">
                            <span className="text-zinc-700 mb-6 ">{car.year} | {car.km}</span>
                            <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
                        </div>

                        <div className="w-full h-px bg-slate-200 my-2"></div>

                        <div className="px-2 pb-2">
                            <span className="text-black ">
                                {car.city}
                            </span>
                        </div>
                    </section>
                
                </Link>
            ))}
                
            </main>
        </Container>
            
        
    )
}