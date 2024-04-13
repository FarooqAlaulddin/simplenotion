const handleNotionhqError = (notionhqErr) =>{
    return JSON.parse(notionhqErr.body)
}
export default handleNotionhqError