import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export function GalleryContainer() {
  // Declaration of various hooks - self explanatory
  const [images, setImages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  // On page load, fetches initial set of images from redis db
  useEffect(() => {
    async function fetchInitialImages() {
      try {
        const response = await axios.get('http://localhost:3000/getRedis');
        // places received images into image array
        setImages(response.data.images);
      } catch (error) {
        console.error(error);
      }
    }
    // Runs function that we just declared
    fetchInitialImages();
  }, []);
  // Function for loading more images
  const loadMoreImages = useCallback(async () => {
    // Loading variable -> is set to true if info is loading into redis db
    if (loading) return;
    // Sets loading to true in order to ensure function doesn't run before one instance has finished (either due to quick
    // scrolling, lag etc.)
    setLoading(true);
    try {
      // Axios call to retrieve the next 16 images
      const response = await axios.get('http://localhost:3000/more');
      // Set images hook used to append the new response images to our array of images to render
      setImages((prevImages) => [...prevImages, ...response.data.images]);
      // Page number increase - this is used along with the screen size to determine when we need begin calling the load
      // more images function on scroll events
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    } catch (error) {
      console.error(error);
    }
    // Returns loading to false on completion
    setLoading(false);
  }, [loading]);

  // A func called on user scrolls
  const handleScroll = useCallback(() => {
    // Determines whether to call loadmoreimages - based on how close user is to the bottom of the currently loaded imgs
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.offsetHeight/2
    ) {
      loadMoreImages();
    }
  }, [loadMoreImages]);
  // Adds the event listener on page load
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {window.removeEventListener('scroll', handleScroll);}
  }, [handleScroll]);

  return (
    <div>
      <h1>Gallery</h1>
      <div className="gallery">
        {images.map((imageUrl, index) => (
          <div className="gallery-item" key={index}>
            <img className="newImg" src={imageUrl} alt={`Image ${index}`} />
          </div>
        ))}
      </div>
      {loading && <p>Loading more images...</p>}
    </div>
  );
}

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';

// export function GalleryContainer() {
//   const [images, setImages] = useState([]);
//   const [pageNumber, setPageNumber] = useState(1);

//   useEffect(() => {
//     async function fetchImages() {
//       try {
//         const response = await axios.get('http://localhost:3000/getRedis');
//         setImages(response.data.images);
//       } catch (error) {
//         console.error(error);
//       }
//     }

 
//     fetchImages();
//   }, []);



//   return (
//     <div>
//       <h1>Gallery</h1>
//       <div className="gallery">
//         {images.map((imageUrl, index) => (
//           <div className="gallery-item" key={index}>
//             <img className="newImg" src={imageUrl} alt={`Image ${index}`} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// import React from 'react';
// import { ImageComponent } from './imageComponent';
// import { useEffect, useState, useCallback } from 'react';
// const axios = require('axios');

// export function GalleryContainer({ submittedSearchTerm }) {
//   const [urls, setURLs] = useState([]);
//   // const [pageNumber, setPageNumber] = useState(1);
//   // const [keepUpdating, setKeepUpdating] = useState(true);
//   // const [currSearchTerm, setCurrSearchTerm] = useState('');


//   useEffect(() => {

//   }, [])

//   // useEffect(() => {
//   //   if (submittedSearchTerm !== currSearchTerm) {
//   //     setPageNumber(1);
//   //     setURLs([]);
//   //     setKeepUpdating(true);
//   //     setCurrSearchTerm(submittedSearchTerm);
//   //   }
//   // }, [submittedSearchTerm]);

//   // useEffect(() => {
//   //   if (!keepUpdating) return;
//   //   if (currSearchTerm.length) {
//   //     (async () => {
//   //       const res = await axios(
//   //         `http://localhost:3000/search?pg=${pageNumber}&keyword=${currSearchTerm}`,
//   //         {
//   //           mode: 'no-cors'
//   //         }
//   //       );
//   //       const arr = res.data;
//   //       if (arr.length !== 16) setKeepUpdating(false);
//   //       setURLs((oldURLs) => [...oldURLs, ...arr]);
//   //     })();
//   //   } else {
//   //     (async () => {
//   //       const res = await axios(
//   //         `http://localhost:3000/images?pg=${pageNumber}`,
//   //         {
//   //           mode: 'no-cors'
//   //         }
//   //       );
//   //       const arr = res.data;
//   //       if (arr.length !== 16) setKeepUpdating(false);
//   //       setURLs((oldURLs) => [...oldURLs, ...arr]);
//   //     })();
//   //   }
//   // }, [pageNumber, currSearchTerm]);

//   // //Infinite scrolling logic.
//   // const onScroll = useCallback(() => {
//   //   const scrollTop = document.documentElement.scrollTop;
//   //   const scrollHeight = document.documentElement.scrollHeight;
//   //   const clientHeight = document.documentElement.clientHeight;
//   //   if (scrollTop + clientHeight >= scrollHeight) {
//   //     setPageNumber(pageNumber + 1);
//   //   }
//   // }, [pageNumber]);

//   // useEffect(() => {
//   //   window.addEventListener('scroll', onScroll);
//   //   return () => window.removeEventListener('scroll', onScroll);
//   // }, [onScroll]);

//   const toRender = urls.map((url) => {
//     return <ImageComponent key={Math.random() + Date.now()} imgUrl={url} />;
//   });

//   return <div className="galleryContainer">{toRender}</div>;
// }