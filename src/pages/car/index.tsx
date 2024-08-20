import { useState, useEffect } from "react"
import { Container } from "../../components/container"
import { FaWhatsapp } from "react-icons/fa"
import { useParams, useNavigate } from "react-router-dom"

import { getDoc, doc } from "firebase/firestore"
import { db } from "../../services/firebaseConection"

import { Swiper, SwiperSlide } from "swiper/react"



//===============================================================

interface CarProps{
    id: string;
    name:string;
    model: string;
    city: string;
    price: string | number;
    uid: string;
    description: string;
    year: string;
    created: string;
    km: string;
    whatsapp: string;
    owner: string;
    image: ImagesCarProps[];
}



interface ImagesCarProps{
    uid: string;
    name: string;
    url: string;
}

export function CarDetail() {
    const { id } = useParams();
    const [ car, setCar ] = useState<CarProps>()
    const [slidePreview, setSlidePreview] = useState<number>(2)
    const navigate = useNavigate()

    useEffect(() => {

        async function loadCar() {
            if(!id){ return }

            const docRef = doc(db, "cars", id)
            getDoc(docRef)
            .then((snapshot) => {

                if(!snapshot.data()){
                    navigate("/")
                }



                setCar({
                    id: snapshot.id,
                    name: snapshot.data()?.name,
                    year: snapshot.data()?.year,
                    city: snapshot.data()?.city,
                    model: snapshot.data()?.model,
                    description: snapshot.data()?.description,
                    uid: snapshot.data()?.uid,
                    created: snapshot.data()?.created,
                    whatsapp: snapshot.data()?.whatsapp,
                    km: snapshot.data()?.km,
                    owner:snapshot.data()?.owner,
                    price: snapshot.data()?.price,
                    image: snapshot.data()?.image

                })
            })
        }


        loadCar();

    }, [id])


    useEffect(() => {

        function handleResize(){
            if(window.innerWidth < 720){
                setSlidePreview(1)
            }else{
                setSlidePreview(slidePreview)
            }
        }

        handleResize();

        window.addEventListener("resize", handleResize)

        return() => {
            window.removeEventListener("resize", handleResize)
        }

    },[])
    

    return(
        <Container>
            
            {car && (
                <Swiper
                slidesPerView={slidePreview}
                pagination={{ clickable: true }}
                navigation
            >
                {car?.image.map( img => (
                <SwiperSlide key={img.name}>
                    <img
                    src={img.url}
                    className="w-full h-66 object-cover"
                    />
                </SwiperSlide>
                ))}
            </Swiper>
            ) }
            
        {car && (
            <main className="w-full bg-white rounded-lg p-6 my-4">
                <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                    <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
                    <h1 className="font-bold text-3xl text-black">R$ {car?.price}</h1>
                </div>
                <p>{car?.model}</p>

                <div className="flex w-full gap-6 my-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <p>Cidade:</p>
                            <strong>{car?.city}</strong>
                        </div>
                        <div>
                            <p>Ano:</p>
                            <strong>{car?.year}</strong>
                        </div>
                    </div>

                        <div className="flex flex-col gap-4">
                        <div>
                            <p>Km:</p>
                            <strong>{car?.km}</strong>
                        </div>                      
                    </div>
                </div>

                <strong>Descrição:</strong>
                <p className="mb-4">{car?.description}</p>


                <strong>Telefone / Whatsapp:</strong>
                <p>{car?.whatsapp}</p>

                <a 
                href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car?.name} e fiquei interessado.`} 
                target="_blank"
                className=" cursor-pointer bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium">
                    Conversar com vendedor
                    <FaWhatsapp size={26} color="#fff"/>
                </a>


            </main>
        )}





        </Container>
    )
}