import Head from "next/head";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import styles from "../styles/Home.module.css";
import { useState } from "react";

// Cities Data
let cities = ["Cairo", "Dubai", "New York", "Nairobi", "Jeddh"];
let finalData = [];
const sentData = {
  Entries: {
    Entry: [
      {
        message: "It is very hot in, Cairo",
        sentiment: "Neutrual",
        date: "2022-06-3",
      },
      {
        message: "There is new project started in, Nairobi",
        sentiment: "Positive",
        date: "2022-03-17",
      },
      {
        message:
          "Dubai EXPO 2020 will create a new image for the middle, Dubai",
        sentiment: "Positive",
        date: "2021-12-20",
      },
      {
        message: "I hate black people, there are so many of them in, New York",
        sentiment: "Negative",
        date: "2022-4-11",
      },
      {
        message: "Do you COVID Vaccine, Jeddh, is good?",
        sentiment: "Negative",
        date: "2021-10-9",
      },
    ],
  },
};

// Helper Functions
const fnMatches = (cities, str) =>
  str.match(new RegExp(cities.join("|"), "gi"));

const getCoordinates = async (address, entry) => {
  const res = await fetch(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      address +
      "&key=" +
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  );
  const data = await res.json();
  const lat = data.results[0].geometry.location.lat;
  const lng = data.results[0].geometry.location.lng;
  let position = { lat, lng };
  finalData.push({ ...entry, position });
};
const formatDate = (dt) => {
  let max_number_of_months = 12;
  let messageDate = new Date(dt);
  let today = new Date();
  let diff = (today.getTime() - messageDate.getTime()) / 1000;
  diff /= 60 * 60 * 24 * 7 * 4;
  let difference_in_months = Math.abs(Math.floor(diff));
  let difference_from_max = max_number_of_months - difference_in_months;
  if (difference_from_max < 0) {
    return 0;
  } else {
    return difference_from_max / max_number_of_months;
  }
};

// get Locations Data (lat,lng)
export const getStaticProps = async () => {
  let entries = sentData.Entries.Entry;

  let promises = await Promise.all(
    entries.map(async (entry) => {
      let city = fnMatches(cities, entry.message)[0];
      return await getCoordinates(city, entry);
    })
  );

  return {
    props: {
      finalData: finalData,
      entries: entries,
    },
  };
};

//Location and Map initial settings
const containerStyle = {
  width: "1400px",
  height: "700px",
};

const center = {
  lat: 30.0444196,
  lng: 31.2357116,
};

export default function Home({ finalData }) {
  const [selected, setSelected] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) {
    return <div> Loading .... </div>;
  }
  return (
    <>
      <Head>
        <title> Casita Task | Home</title>
      </Head>

      <div>
        <h1 className={styles.title}>
          Sorting and Visualizing Messages feed Source
        </h1>
      </div>

      <div className={styles.mapContainer}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={3}
          options={{
            streetViewControl: false,
          }}
        >
          {finalData.map((entry, index) => (
            <Marker
              key={index}
              position={entry.position}
              title={entry.date}
              opacity={formatDate(entry.date)}
              icon={{
                url: `${
                  entry.sentiment === "Neutrual"
                    ? "/blue icon.png"
                    : entry.sentiment === "Positive"
                    ? "/green icon.png"
                    : "/red icon.png"
                }`,
                scaledSize: new window.google.maps.Size(30, 30),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(5, 20),
              }}
              onClick={() => setSelected(entry)}
            />
          ))}
          {selected && (
            <InfoWindow
              position={selected.position}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                <h3 className={styles.message}>{selected.message}</h3>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </>
  );
}
