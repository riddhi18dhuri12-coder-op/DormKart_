
document.addEventListener("DOMContentLoaded",()=>{

const toggle=document.getElementById("darkToggle")

if(toggle){
toggle.onclick=()=>{
document.body.classList.toggle("dark")
}
}

})
