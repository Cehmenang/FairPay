import { SERVER_API } from "$env/static/private";

export async function PATCH({ params, request }){
    const { paymentMethod } = await request.json()
    try{
        const response = await fetch(`${SERVER_API}/participant/${params.id}/claim/${params.url}`, { 
            method: 'PATCH',
            body: JSON.stringify({paymentMethod}),
            headers: { "Content-Type": "application/json" } })
        return response
    }catch(err){ console.log(err) }
}