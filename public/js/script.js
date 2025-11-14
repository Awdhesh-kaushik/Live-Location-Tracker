const socket = io();

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

if (navigator.geolocation) {
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Location:", latitude, longitude, "Accuracy:", position.coords.accuracy);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );

    // Optionally, you can clear the watch when the socket disconnects
    socket.on("disconnect", () => {
        navigator.geolocation.clearWatch(watchId);
    });
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

socket.on("update-clients", (clients) => {
    const clientsList = document.getElementById("clients-list");
    clientsList.innerHTML = "";
    clients.forEach(clientId => {
        const li = document.createElement("li");
        li.textContent = clientId;
        clientsList.appendChild(li);
    });
});
