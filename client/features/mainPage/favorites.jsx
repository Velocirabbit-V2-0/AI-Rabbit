import React from 'react';
import { GalleryContainer } from '../gallery/galleryContainer';
import { SearchComponent } from './searchComponent';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import BlobView from '../testRenderBlob/blobView';
import { useLocation, useParams } from 'react-router-dom';
function favorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const { viewParam } = useParams();
  const [layout, setLayout] = useState();
  const [image, setImage] = useState([]);
  const [numImages, setNumImages] = useState(0);
  const searchTermHandler = (searchFieldValue) => {
    setSearchTerm(searchFieldValue);
  };
  const convertImgToUint8 = (file) => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('onload', reader.result);
        const Uint8Arr = Array.from(new Uint8Array(reader.result));
        res(Uint8Arr);
      };
      reader.onerror = () => {
        rej('Conversion error');
      };
      reader.readAsArrayBuffer(file);
    });
  };
  const convertUint8ToImg = async (binaryData, imageType = 'image/png') => {
    const blob = new Blob([binaryData], { type: imageType });
    const imageURL = URL.createObjectURL(blob);
    return imageURL;
  };
  useEffect(() => {
        const asyncFetch = async () => {
          const res = await fetch('/imagesV2/get_all_images');
          const json = await res.json();
          for(let i = 0; i < json.length; i++){
            const img = json[i];
            const Uint8 = new Uint8Array(img.image.data);
            const url = await convertUint8ToImg(Uint8, 'image/png');
            console.log(url)
            const imgDiv = <img className = 'favImg' src={url} alt='' />;
            setImage(prev => [...prev, imgDiv]);
            // console.log(“image", image)
          }
          setNumImages(json.length)
        };
        if(numImages === 0){
          asyncFetch();
        }
    }, [numImages]);
  const handleChange = async (e) => {
    try {
      console.log(e.target.files[0]);
      const file = e.target.files[0];
      const Uint8Arr = await convertImgToUint8(file);
      const binaryJSON = JSON.stringify(Uint8Arr);
      console.log('sending binary', binaryJSON);
      const res = await fetch('/imagesV2/save_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ image: binary, tags: [new Date()] }),
        body: JSON.stringify({ image: Uint8Arr }),
      });
      const json = await res.json();
      console.log(json);
    } catch (err) {
      console.log("Change Error", err);
    }
  };
    return (
      <>
        <div className="header">
          <a href="#default" className="logo">
            Optica
          </a>
          <div className="header-right">
            <Link to="/" className="active">
              Home
            </Link>
            <Link to="/favorites" className="active">
                Favorites
              </Link>
              <Link to="/Contact" className="active">
                Contact
              </Link>
              <Link to="/About" className="active">
                About
              </Link>
            <Link to='/login' className='loginButton'>
              Login
            </Link>
          </div>
        </div>
        <div className="mainPage">
            <h1>Optica</h1>
            <h3>The OpenAI DALL&#8226;E Search Engine</h3>
            <div>
          <input type="file" onChange={handleChange}></input>
          </div>
          <div className = 'favGrid'>{image}</div>
        </div>
    </>
      );
}
export default favorites;