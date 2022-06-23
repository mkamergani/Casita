import Head from "next/head";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import styles from "../styles/Home.module.css";
import { useEffect } from "react";

// Cities Data
let cities = ["Cairo", "Dubai", "New York", "Nairobi", "Jeddh"];
let finalData = [];
const sentData = {
  Entries: {
    Entry: [
      {
        message: "It is very hot in, Cairo",
        sentiment: "Neutrual",
      },
      {
        message: "There is new project started in, Nairobi",
        sentiment: "Positive",
      },
      {
        message:
          "Dubai EXPO 2020 will create a new image for the middle, Dubai",
        sentiment: "Positive",
      },
      {
        message: "I hate black people, there are so many of them in, New York",
        sentiment: "Negative",
      },
      {
        message: "Do you COVID Vaccine, Jeddh, is good?",
        sentiment: "Negative",
      },
    ],
  },
};

const fnMatches = (cities, str) =>
  str.match(new RegExp(cities.join("|"), "gi"));

const getCoordinates = async (address, entry) => {
  const res = await fetch(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      address +
      "&key=" +
      "AIzaSyB2PmNfNRakro9TLDS-8PC7keJGB6mAB_U"
  );
  const data = await res.json();
  const lat = data.results[0].geometry.location.lat;
  const lng = data.results[0].geometry.location.lng;
  let position = { lat, lng };
  finalData.push({ ...entry, position });
};
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

//Location and Map
const containerStyle = {
  width: "1000px",
  height: "1000px",
};

const center = {
  lat: 30.0444196,
  lng: 31.2357116,
};

export default function Home({ finalData, entries }) {
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
          zoom={5}
          options={{
            streetViewControl: false,
          }}
        >
          {finalData.map((entry, index) => (
            <Marker
              key={index}
              position={entry.position}
              title={entry.message}
            />
          ))}
        </GoogleMap>
      </div>
    </>
  );
}
