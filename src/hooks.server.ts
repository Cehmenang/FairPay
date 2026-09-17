import { redirect, type Handle } from "@sveltejs/kit"
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from '$env/static/private';

const guestRoutes = ['/login', '/register']
const protectedRoutes = ['/bills', '/contacts', '/history']

export const handle: Handle = async({ event, resolve })=>{
    const token = event.cookies.get('accessToken') as string | null
    const currentPath = event.url.pathname;
    if(token && guestRoutes.some(route=>currentPath.startsWith(route))){
        throw redirect(301, '/')
    }
    if(!token && protectedRoutes.some(route=>currentPath.startsWith(route))){
        throw redirect(301, '/')
    }

    let user

    if(token){
        try{
            const verify = jwt.verify(token, JWT_SECRET!) as JwtPayload
            user = { username: verify.username, email: verify.email } as { username: string, email: string }
        }catch(err){ user = null }
    }
    event.locals.user = user
    return await resolve(event)
}