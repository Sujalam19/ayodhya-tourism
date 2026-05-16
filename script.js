/* PAGE SWITCH */
function showPage(id){
document.querySelectorAll(".hero").forEach(sec=>sec.classList.remove("active"));
document.getElementById(id).classList.add("active");
window.scrollTo({ top: 0, behavior: "smooth" });
}

/* IMAGE FULL VIEW */
function openImage(src){
document.getElementById("lightbox").style.display="flex";
document.getElementById("lightImg").src = src;
}

function closeImage(){
document.getElementById("lightbox").style.display="none";
}

/* HOTEL IMAGE SLIDER */
let images=[
{
    src:"images/home.png",
    title:"Shree Sharanam Hotel",
    price:"Hotel Exterior"
},
{
    src:"images/home(f).png",
    title:"Hotel Front View",
    price:"Hotel Exterior"
},
{
    src:"images/room1.png",
    title:"Deluxe AC Room",
    price:"\u20B91200/night"
},
{
    src:"images/nonac.png",
    title:"Non AC Room",
    price:"\u20B9900/night"
},
{
    src:"images/4bed.png",
    title:"Family 4 Bed Room",
    price:"\u20B91300/night"
},
{
    src:"images/4bedac.png",
    title:"Family 4 Bed AC Room",
    price:"\u20B91500/night"
},
{
    src:"images/menu.png",
    title:"Food Menu Card",
    price:"Menu Card"
}
];

let i=0;
let latestAvailability = null;

function updateRoomSlider(){
const room = images[i];
document.getElementById("slide").src=room.src;
document.getElementById("slide").alt=room.title;
document.getElementById("roomTitle").textContent=room.title;
document.getElementById("roomPrice").textContent=room.price;
}

function next(){
i=(i+1)%images.length;
updateRoomSlider();
}

function prev(){
i=(i-1+images.length)%images.length;
updateRoomSlider();
}

/* SAVE DATA GOOGLE SHEET */
const scriptURL =
"https://script.google.com/macros/s/AKfycbwRAmfk-Ru7SusIde2d6ttwA9KhhAufcLpGAqxgDRtw7Cjt5LR4rEx-l8fO6c5qwcOWag/exec";

let latestBooking = {};
let person = 1;

function getRoomAvailability(dateValue){
    if(!dateValue){
        return null;
    }

    const statuses = [
        { rooms: 5, text: "5 rooms available", status: "available" },
        { rooms: 2, text: "Only 2 rooms left", status: "limited" },
        { rooms: 0, text: "No rooms available", status: "full" }
    ];

    return statuses[Math.floor(Math.random() * statuses.length)];
}

function showAvailability(){
    const dateInput = document.getElementById("date");
    const availabilityBox = document.getElementById("availabilityBox");
    latestAvailability = getRoomAvailability(dateInput.value);

    availabilityBox.classList.remove("available","limited","full");
    availabilityBox.dataset.rooms = "";

    if(!latestAvailability){
        availabilityBox.textContent = "Select a date to check room availability";
        return;
    }

    availabilityBox.classList.add(latestAvailability.status);
    availabilityBox.textContent = latestAvailability.text;
    availabilityBox.dataset.rooms = latestAvailability.rooms;
}

function changePlaceholder(){
    let service = document.getElementById("service").value;
    let details = document.getElementById("details");

    if(service==="Hotel Booking"){
        details.placeholder="Example:\nNeed deluxe AC room";
    }
    else if(service==="Cab Service"){
        details.placeholder="Example:\nPickup from railway station";
    }
    else if(service==="VIP Darshan"){
        details.placeholder="Example:\nMorning slot required";
    }
    else if(service==="Tour Guide"){
        details.placeholder="Example:\nHindi guide required";
    }
    else if(service==="Food Package"){
        details.placeholder="Example:\nPure veg food package";
    }
    else{
        details.placeholder=
        "Examples:\nHotel booking: Need deluxe AC room\nCab booking: Pickup from railway station\nVIP Darshan: Morning slot required";
    }
}

function submitBooking(){
    let service = document.getElementById("service").value;
    let date = document.getElementById("date").value;
    let availabilityBox = document.getElementById("availabilityBox");
    let availableRooms = availabilityBox.dataset.rooms || "";

    if(!document.getElementById("name").value || !document.getElementById("phone").value || !date || !service){
        alert("Please fill name, phone, date and service.");
        return;
    }

    if(!availableRooms){
        showAvailability();
        availableRooms = availabilityBox.dataset.rooms || "";
    }

    if(service === "Hotel Booking" && Number(availableRooms) === 0){
        alert("No rooms available. Please select another date.");
        return;
    }

    let advance = getAdvanceAmount(service);
    let bookingID = "AYO" + Math.floor(10000 + Math.random()*90000);

    latestBooking = {
        timestamp: new Date().toLocaleString(),
        bookingID,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        date,
        service,
        persons: document.getElementById("personCount").value,
        details: document.getElementById("details").value,
        availableRooms,
        advance,
        paymentId: ""
    };

    showPaymentPopup();
}

function showPaymentPopup(){
    document.getElementById("paymentMessage").innerHTML =
    `
    Service: ${latestBooking.service}<br><br>
    Date: ${latestBooking.date}<br><br>
    Advance Amount: Rs. ${latestBooking.advance}<br><br>
    Razorpay TEST mode payment will open after confirmation.
    `;

    document.getElementById("paymentPopup").style.display = "flex";
}

function closePaymentPopup(){
    document.getElementById("paymentPopup").style.display = "none";
}

function startRazorpayPayment(){
    closePaymentPopup();

    if(typeof Razorpay === "undefined"){
        latestBooking.paymentId = "TEST-MANUAL";
        sendBooking(latestBooking);
        return;
    }

    var options = {
        key: "rzp_test_SoKayhXvmZ6kiJ",
        amount: latestBooking.advance * 100,
        currency: "INR",
        name: "Ayodhya Tourism",
        description: latestBooking.service + " Advance Payment",
        image: "images/home.png",

        handler: function (response){
            latestBooking.paymentId = response.razorpay_payment_id;
            sendBooking(latestBooking);
        },

        prefill: {
            name: latestBooking.name,
            email: latestBooking.email,
            contact: latestBooking.phone
        },

        theme: {
            color: "#FFD700"
        }
    };

    var rzp = new Razorpay(options);
    rzp.open();
}

function sendBooking(data){
fetch(scriptURL,{
    method:"POST",
    body: JSON.stringify(data)
})
.then(res=>res.text())
.then(()=>{
    showSuccessPopup();
})
.catch(err=>{
    console.log(err);
    showSuccessPopup();
});
}

function increasePerson() {
    person++;
    document.getElementById("personCount").value = person;
}

function decreasePerson() {
    if(person > 1){
        person--;
        document.getElementById("personCount").value = person;
    }
}

function closePopup(){
document.getElementById("successPopup").style.display = "none";
}

function showSuccessPopup(){
document.getElementById("successPopup").style.display = "flex";

document.getElementById("popupMessage").innerHTML =
`
Booking ID: ${latestBooking.bookingID}<br><br>
Service: ${latestBooking.service}<br><br>
Advance Amount: Rs. ${latestBooking.advance}<br><br>
Date: ${latestBooking.date}<br><br>
Cancellation Policy:<br>
48 hrs before:<br>
75% refund<br><br>
Less than 24 hrs:<br>
No refund
`;

let msg =
`Booking Confirmed

Name: ${latestBooking.name}
Booking ID: ${latestBooking.bookingID}
Service: ${latestBooking.service}
Persons: ${latestBooking.persons}
Date: ${latestBooking.date}
Advance Paid: Rs. ${latestBooking.advance}

Cancellation Policy
48 hrs before: 75% refund
Less than 24 hrs: No refund`;

const whatsappUrl = `https://wa.me/${latestBooking.phone}?text=${encodeURIComponent(msg)}`;
document.getElementById("whatsappBtn").href = whatsappUrl;

setTimeout(function(){
    window.open(whatsappUrl, "_blank");
}, 600);
}

function getAdvanceAmount(service){
    if(service === "Hotel Booking"){
        return 500;
    }

    return 100;
}

async function downloadPDF(){
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

try{
    const logo = await loadImageAsDataUrl("images/home.png");
    doc.addImage(logo, "PNG", 15, 12, 28, 20);
}
catch(error){
    console.log(error);
}

doc.setFontSize(20);
doc.setTextColor(120, 82, 0);
doc.text("Ayodhya Tourism", 50, 22);

doc.setFontSize(13);
doc.setTextColor(0, 0, 0);
doc.text("Booking Confirmation", 20, 45);
doc.line(20, 50, 190, 50);

doc.setFontSize(11);
doc.text(`Name: ${latestBooking.name}`,20,65);
doc.text(`Booking ID: ${latestBooking.bookingID}`,20,75);
doc.text(`Phone: ${latestBooking.phone}`,20,85);
doc.text(`Email: ${latestBooking.email || "N/A"}`,20,95);
doc.text(`Service: ${latestBooking.service}`,20,105);
doc.text(`Persons: ${latestBooking.persons}`,20,115);
doc.text(`Date: ${latestBooking.date}`,20,125);
doc.text(`Advance Paid: Rs. ${latestBooking.advance}`,20,135);
doc.text(`Payment ID: ${latestBooking.paymentId || "N/A"}`,20,145);

doc.setFontSize(13);
doc.text("Cancellation Policy", 20, 165);
doc.setFontSize(11);
doc.text("48 hrs before: 75% refund",20,177);
doc.text("Less than 24 hrs: No refund",20,187);

doc.save("booking.pdf");
}

function loadImageAsDataUrl(src){
    return new Promise(function(resolve, reject){
        const image = new Image();
        image.onload = function(){
            try{
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            resolve(canvas.toDataURL("image/png"));
            }
            catch(error){
                reject(error);
            }
        };
        image.onerror = reject;
        image.src = src;
    });
}

document.addEventListener("DOMContentLoaded", function(){
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    updateRoomSlider();
});
