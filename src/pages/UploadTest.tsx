import React, { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase-config';

function UploadTest() {
  const docRef = doc(db, "Projects", "AIX-Diljit");

  const getData = async () => {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return <div>UploadTest</div>;
}

export default UploadTest;
