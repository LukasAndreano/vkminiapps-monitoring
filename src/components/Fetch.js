export default async function fetch2(method, params) {
    let fetch_params = params || ''
    const data = await fetch(`https://monitoring.lukass.ru/` + method + `?` + fetch_params + `&` + window.location.href.slice(window.location.href.indexOf('?') + 1))
    return await data.json()
}