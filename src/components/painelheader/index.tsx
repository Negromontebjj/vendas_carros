import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConection";




export function DashboardHeader(){


    async function handleLogout() {
        await signOut(auth)
    }


    return(

        <div className="w-full items-center flex h-12 bg-red-600 rounded-lg text-white fonte-medium gap-4 px-4 mb-4">
            <Link to="/dashboard">
               - Dashboard -
            </Link>

            <Link to="/dashboard/new">
               - Cadastrar veiculo -
            </Link>

            <button className="ml-auto font-bold " onClick={handleLogout}>
                Sair da conta
            </button>
        </div>
        
    )
}



