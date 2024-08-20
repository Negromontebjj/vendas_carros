import { ChangeEvent, useState, useContext } from "react";

import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { FiUpload, FiTrash } from "react-icons/fi";

import { AuthContext } from "../../../contexts/AuthContext";

import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../../services/firebaseConection";
import { ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";

import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";



//==========================================================================

// schema de validações com zod
const schema = z.object({
    name: z.string().nonempty("O campo é obrigatório"),
    model: z.string().nonempty("O modelo é obrigatório"),
    year: z.string().nonempty("O ano do carro é obrigatório"),
    km: z.string().nonempty("O km do carro é obrigatório"),
    price: z.string().nonempty("O Preço é obrigatório"),
    city: z.string().nonempty("A cidade é obrigatório"),
    whatsapp: z.string().min(1,"O Telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
        message: "Número de telefone inválido!"
    }),
    description: z.string().nonempty("A descrição é Obrigatória.")
    
})

type FormData = z.infer<typeof schema>;

interface ImageProps{
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}


export function New() {
    const { user } = useContext(AuthContext)
    const {register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    })

    const [carImage, setCarImage] = useState<ImageProps[]>([])


    async function handleFile(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files && e.target.files[0] ){
            const image = e.target.files[0]

            if(image.type === "image/jpeg" || image.type === "image/png"){
                await handleUpload(image)
            }else{
                alert(" Envie uma imagem JPEG ou PNG.")
                return;
            }
        }
    }


    async function handleUpload(image: File){
        if(!user?.uid){
            return;
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)
        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadUrl) =>{
                const imageItem = {
                    name: uidImage,
                    uid: currentUid,
                    previewUrl: URL.createObjectURL(image),
                    url: downloadUrl,
                }

                setCarImage((image) => [...image, imageItem])
                toast.success("Imagem Cadastrada com sucesso!")

            })
        })  
    }
    

    function onSubmit(data: FormData){
        if(carImage.length === 0){
            toast.error("Envie pelo menos 1 imagem.")
            return;
        }

        const carListImage = carImage.map((car) => {
            return{
                uid: car.uid,
                name: car.name,
                url: car.url,
            }
        })

        addDoc(collection(db, "cars"), {
            name: data.name.toLocaleUpperCase(),
            model: data.model,
            whatsapp:data.whatsapp,
            city: data.city,
            year: data.year,
            price: data.price,
            km: data.km,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            image: carListImage,
        })
        .then(() => {
            reset();
            setCarImage([])
            console.log("Cadastrado com sucesso.")
            toast.success("Carro cadastrado com sucesso!")

        })
        .catch((error) => {
            console.log(error)
            console.log("Erro ao cadastrar no Banco.")
        })
    }


    async function handleDeleteImage(item: ImageProps){
        const imagePath = `images/${item.uid}/${item.name}`;

        const imageRef = ref(storage, imagePath)

        try{
            await deleteObject(imageRef)
            setCarImage(carImage.filter((car) => car.url !== item.url))
        }catch(error){
            console.log("Erro ao deletar")
        }
    }
    
    
    return(
        <Container>
            <DashboardHeader/>


            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 shadow-lg">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48 ">
                    <div className="absolute cursor-pointer">
                        <FiUpload size={30} color="#000"/>
                    </div>

                    <div className="cursor-pointer ">
                        <input 
                            className="opacity-0 cursor-pointer " 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFile}
                        />
                    </div>
                </button>

                {carImage.map( item => (
                    <div key={item.name} className=" h-32 flex items-center justify-center relative">

                        <button className="absolute" onClick={() => handleDeleteImage(item)}> 
                            <FiTrash size={28} color="#fff"/> 
                        </button>

                        <img
                            src={item.previewUrl}
                            className="rounded-lg w-full h-32 object-cover"
                            alt="Foto do carro"
                        
                        />
                    </div>

                ))}

            </div>


            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2 shadow-lg">
                <form
                    className="w-full"
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placeholder="Ex: Onix 1.0"
                        
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placeholder="Ex: 1.0 flex plus manual"
                        
                        />
                    </div>


                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano</p>
                            <Input
                                type="text"
                                register={register}
                                name="year"
                                error={errors.year?.message}
                                placeholder="Ex: 2024/2024"
                            
                            />
                        </div>


                        <div className="w-full">
                            <p className="mb-2 font-medium">Km</p>
                            <Input
                                type="text"
                                register={register}
                                name="km"
                                error={errors.km?.message}
                                placeholder="Ex: 23100"
                            
                            />
                        </div>
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Telefone / Whatsapp</p>
                                <Input
                                    type="number"
                                    register={register}
                                    name="whatsapp"
                                    error={errors.whatsapp?.message}
                                    placeholder="Ex: 081900000000"
                                
                                />
                        </div>


                        <div className="w-full">
                            <p className="mb-2 font-medium">Cidade</p>
                                <Input
                                    type="text"
                                    register={register}
                                    name="city"
                                    error={errors.city?.message}
                                    placeholder="Ex: Recife - PE"
                                
                                />
                        </div>          
                    
                </div>

                <div className="mb-3">
                    <p className="mb-2 font-medium">Preço</p>
                        <Input
                            type="text"
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placeholder="Ex: 46.700"
                        
                        />
                </div>


                <div className="mb-3">
                    <p className="mb-2 font-medium">Descrição</p>
                    <textarea 
                        className="border-2 w-full rounded-md h-24 px-2"
                        {...register("description")}
                        name="description"
                        id="description"
                        placeholder="Discrição completa sobre o carro."
                    
                    />

                    {errors.description && <p className="mb-1 text-red-500 font-bold">{errors.description.message}</p>}
                        
                </div>

                <button type="submit" className="w-full rounded-md bg-red-600 text-white text-2xl h-10"> Cadastrar</button>

                </form>

            </div>
        </Container>
    )
}
