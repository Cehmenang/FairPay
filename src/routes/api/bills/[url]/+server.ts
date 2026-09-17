import { SERVER_API } from "$env/static/private";

export async function GET({ params, request }){
    const cookie = request.headers.get('cookie') as string
    try{
        const response = await fetch(`${SERVER_API}/bill/${params.url}`, { 
            method: 'GET', headers: { "Cookie": cookie } })
        return response
    }catch(err){ console.log(err) }
}