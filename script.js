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

/* SLIDER */
let images=[
{
    src:"images/home.png",
    title:"Shree Sharanam Hotel",
    price:"Hotel Exterior"
},
{
    src:"images/home(f).png",
    title:"Shree Sharanam Hotel",
    price:"Hotel Exterior"
},
{
    src:"images/room1.png",
    title:"Deluxe AC Room",
    price:"₹1200/night"
},
{
    src:"images/nonac.png",
    title:"Non AC Room",
    price:"₹900/night"
},
{
    src:"images/4bed.png",
    title:"Family 4 Bed Room",
    price:"₹1300/night"
},
{
    src:"images/4bedac.png",
    title:"Family 4 Bed AC Room",
    price:"₹1500/night"
},
{
src:"images/menu.png",
title:"Shree Sharanam Hotel",
price:"Hotel Exterior"
}
];

let i=0;

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

    const date = new Date(dateValue + "T00:00:00");
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const totalRooms = 12;
    const bookedRooms = (day * 3 + month * 2) % 11;
    const availableRooms = Math.max(totalRooms - bookedRooms, 0);

    return {
        totalRooms,
        bookedRooms,
        availableRooms
    };
}

function showAvailability(){
    const dateInput = document.getElementById("date");
    const availabilityBox = document.getElementById("availabilityBox");
    const availability = getRoomAvailability(dateInput.value);

    availabilityBox.classList.remove("available","full");

    if(!availability){
        availabilityBox.textContent = "Select a date to check room availability";
        return;
    }

    if(availability.availableRooms > 0){
        availabilityBox.classList.add("available");
        availabilityBox.textContent =
        `${availability.availableRooms} rooms available on selected date`;
    }
    else{
        availabilityBox.classList.add("full");
        availabilityBox.textContent =
        "Rooms are full on selected date. Please choose another date.";
    }
}

function changePlaceholder(){
    let service = document.getElementById("service").value;
    let details = document.getElementById("details");

    if(service==="Hotel Booking"){
        details.placeholder=
        "Example:\n- Need AC Room\n- Early Check-in\n- Near Ram Mandir\n- Family Room";
    }
    else if(service==="Cab Service"){
        details.placeholder=
        "Example:\n- Pickup from Railway Station\n- Drop at Ram Mandir\n- Airport Pickup";
    }
    else if(service==="VIP Darshan"){
        details.placeholder=
        "Example:\n- VIP Darshan for 4 persons\n- Morning slot preferred";
    }
    else if(service==="Tour Guide"){
        details.placeholder=
        "Example:\n- Hindi Guide Required\n- Ayodhya Full Day Tour";
    }
    else if(service==="Food Package"){
        details.placeholder=
        "Example:\n- Pure Veg Food\n- Food for 5 persons";
    }
    else{
        details.placeholder="Select service first...";
    }
}

function submitBooking(){
    let service = document.getElementById("service").value;
    let date = document.getElementById("date").value;
    let availability = getRoomAvailability(date);

    if(!document.getElementById("name").value || !document.getElementById("phone").value || !date || !service){
        alert("Please fill name, phone, date and service.");
        return;
    }

    if(service === "Hotel Booking" && availability && availability.availableRooms === 0){
        alert("Rooms are full on selected date. Please select another date.");
        return;
    }

    let advance = getAdvanceAmount(service);
    let bookingID = "AYO" + Math.floor(10000 + Math.random()*90000);

    latestBooking = {
        bookingID,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        date,
        service,
        persons: document.getElementById("personCount").value,
        details: document.getElementById("details").value,
        availableRooms: availability ? availability.availableRooms : "",
        advance
    };

    if(typeof Razorpay === "undefined"){
        sendBooking(latestBooking);
        return;
    }

    var options = {
        key: "rzp_test_SoKayhXvmZ6kiJ",
        amount: advance * 100,
        currency: "INR",
        name: "Ayodhya Tourism",
        description: service + " Advance Payment",
        image: "logo.png",

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
Date: ${latestBooking.date}<br><br>
Rooms Available: ${latestBooking.availableRooms || "N/A"}<br><br>
Advance Paid: Rs. ${latestBooking.advance}<br><br>
Cancellation Policy:<br>
48 hrs before - 75% refund<br>
Less than 24 hrs - No refund
`;

let msg =
`Booking Confirmed

Booking ID: ${latestBooking.bookingID}
Service: ${latestBooking.service}
Advance Paid: Rs. ${latestBooking.advance}
Date: ${latestBooking.date}
Persons: ${latestBooking.persons}

Cancellation:
48 hrs before = 75% refund
Less than 24 hrs = No refund`;

document.getElementById("whatsappBtn").href =
`https://wa.me/${latestBooking.phone}?text=${encodeURIComponent(msg)}`;
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

doc.text("Ayodhya Tourism Booking", 20,20);
doc.text(`Booking ID: ${latestBooking.bookingID}`,20,40);
doc.text(`Service: ${latestBooking.service}`,20,60);
doc.text(`Advance Paid: Rs. ${latestBooking.advance}`,20,80);
doc.text(`Date: ${latestBooking.date}`,20,100);
doc.text(`Persons: ${latestBooking.persons}`,20,120);
doc.text(`Cancellation Policy:
48 hrs before = 75% refund
Less than 24 hrs = No refund`,20,140);

doc.save("booking.pdf");
}

document.addEventListener("DOMContentLoaded", function(){
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
});
