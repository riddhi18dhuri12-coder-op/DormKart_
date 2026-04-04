
async function addProduct(){

const title=document.getElementById("title").value
const price=document.getElementById("price").value

await supabaseClient.from("products").insert({
title:title,
price:price
})

alert("Product added")

}
