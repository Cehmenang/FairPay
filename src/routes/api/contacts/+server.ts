import { SERVER_API } from "$env/static/private"

export async function GET({ request }){
    const cookie = request.headers.get('cookie') as string
    try{
        const response = await fetch(`${SERVER_API}/participant/contact`, {
            method: 'GET', headers: {
                "Content-Type": "application/json",
                "Cookie": cookie 
            }
        })
        if(!response.ok) throw new Error("Koneksi API Bermasalah!")
        return response
    }catch(err){ console.log(err) }
}

export async function POST({ request }){
    const value = await request.json()
    const cookie = request.headers.get('cookie') as string
    try{
        const response = await fetch(`${SERVER_API}/participant/contact`, {
            method: 'POST', body: JSON.stringify(value), headers: {
                "Cookie": cookie,
                "Content-Type": "application/json"
            }
        })
        if(!response.ok) throw new Error("Koneksi API Bermasalah!")
        return response
    }catch(err){ console.log(err) }
}