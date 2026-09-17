import { SERVER_API } from "$env/static/private";

export async function GET({ params }){
    try{
        const response = await fetch(`${SERVER_API}/bill/claim/${params.url}`, { 
            method: 'GET' })
        return response
    }catch(err){ console.log(err) }
}