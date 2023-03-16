import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export function GalleryContainer() {
  const [images, setImages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInitialImages() {
      try {
        const response = await axios.get('http://localhost:3000/getRedis');
        console.log('In useEffect for setImages');
        setImages(response.data.images);
      } catch (error) {
        console.error(error);
      }
    }

    fetchInitialImages();
  }, []);

  const loadMoreImages = useCallback(async () => {
    if (loading) return;
    console.log('in loadMoreImages');
    setLoading(true);
    try {
      console.log('in loadMoreImages try');
      const response = await axios.get('http://localhost:3000/more');
      console.log('axios get finished');
      setImages((prevImages) => [...prevImages, ...response.data.images]);
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [loading]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.offsetHeight/2
    ) {
      console.log('about to loadMoreImages');
      loadMoreImages();
      console.log('past loadMoreImages');
    }
  }, [loadMoreImages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {console.log('event listener added'); window.removeEventListener('scroll', handleScroll);}
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