import { SERVER_API } from "$env/static/private";

export async function GET({ request }){
    const cookie = request.headers.get('cookie') as string
    try{
        const response = await fetch(`${SERVER_API}/bill`, { 
            method: 'GET', headers: { "Cookie": cookie } })
        return response
    }catch(err){ console.log(err) }
}

export async function POST({ request }){
    const data = await request.json()
    const cookieHeader = request.headers.get('cookie')
    try{
        const response = await fetch(`${SERVER_API}/bill`, {  
            method: 'POST', body: JSON.stringify(data),
            headers: { "Content-Type": "application/json", "Cookie": cookieHeader ?? "" },
        })
        if(!response.ok) throw new Error("Bermasalah!")
    }catch(err){ console.log(err) }
    return Response.json({ message: 'Berhasil!' })
}