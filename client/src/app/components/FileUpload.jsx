import React, { useState } from 'react';
import { FileCard, Loader } from '../components';
import { fantomTestnet } from 'thirdweb/chains';
import { defineChain, prepareContractCall } from 'thirdweb';
import { useActiveAccount, useReadContract, useSendTransaction} from "thirdweb/react";
import { upload } from 'thirdweb/storage';
import { client } from '../client';
import { CONTRACT } from '../../../utils/constants';


const FileUpload = () => {
  const chain = defineChain(fantomTestnet);
  const account = useActiveAccount();
  const contract = CONTRACT;

  const { data: contractData } = useReadContract({
    contract: CONTRACT,
    method: 'getFile',
  });

  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    link: '',
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  // Upload File to IPFS and contract
  const uploadToIpfs = async () => {
    console.log("upload to ipfs called");
    try {
      setIsLoading(true);
      const fileToUpload = new File([file], file.name);
      console.log(file.name);

      // Upload the file to IPFS using thirdweb's storage
      const uris = await upload({
        client,
        files: [fileToUpload],
      });
      console.log("uris", uris);

      // Remove the 'ipfs://' prefix if it exists
      const cleanedUri = uris.replace('ipfs://', '');

      // Construct the IPFS URL
      const clientId = "2b10e68fb0aa505e2b1e115df22f2540"; 
      const ipfsUrl = `https://${clientId}.ipfscdn.io/ipfs/${cleanedUri}`;

      // Save this URL in the form object
      form.link = ipfsUrl;

      // Write the file details to the contract
      await uploadFile({ ...form });

      console.log("File uploaded successfully", ipfsUrl);
    } catch (error) {
      console.error("File upload failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Write to Contract
  const uploadFile = async (form) => {
    console.log("Adding file to smart contract...");

    try {
      // Prepare the contract call using thirdweb
      const transaction = prepareContractCall({
        contract,
        method: 'addFile',
        params: [
          account?.address, // File owner (current account)
          form.name,        // File name
          form.link,        // IPFS link for the file
        ],
      });

      // Send the transaction to the blockchain
      sendTransaction(transaction);
      console.log("Contract call success");

    } catch (error) {
      console.error("Contract call failure:", error);
    }
  };

  // Send transaction to the blockchain using thirdweb
  const { mutate: sendTransaction } = useSendTransaction();

  // Fetch all files from the contract
  const { data: files } = useReadContract({
    contract,
    method: "function getFile() view returns ((address owner, string name, string link)[])",
    params: [],
  });

  // Filter files to only show those uploaded by the connected account
  const filteredFiles = files?.filter((file) => file.owner === account?.address);

  return (
    <div className='my-[30px] flex justify-center items-center'>
      <div className='w-full min-h-screen p-[20px]'>
        <div className='flex justify-center items-center gap-[30px]'>
          <div className='w-screen mx-[20px] h-[500px] ml-[50px]'>
            <h1 className="font-poppins font-semibold text-[35px] text-white text-left tracking-tighter">
              Discover your Uploaded Files!
            </h1>
            <div className="flex flex-wrap mt-[20px] gap-[20px]">
              {isLoading && <Loader />}
              {!isLoading && filteredFiles && (
              filteredFiles.length > 0 ? (
                filteredFiles.map((file)=>(
                  <FileCard
                    key={file.pId}
                    {...file}
                    handleClick={() => window.open(file.link, '_blank')}
                  />
                ))
              ):(
                <p className="font-poppins font-semibold text-[14px] leading-[30px] text-[#818183]">
                  You have not uploaded any files yet
                </p>
              )) 
              }
            </div>
          </div>
          <div className='flex-1 justify-center items-center gap-10 w-[300px] h-[500px] p-[5px] mr-[40px] mt-[60px]'>
            <input
              className='py-[15px] px-[15px] mt-[10px] w-full outline-none bg-[#dfdfe2] font-epilogue text-gray-800 text-[16px] placeholder:text-[#555557] rounded-[10px]'
              type="text"
              placeholder='File name'
              value={form.name}
              onChange={(e) => handleFormFieldChange('name', e)}
            />
            <input
              className='py-[15px] px-[15px] mt-[10px] outline-none bg-[#dfdfe2] font-epilogue text-gray-800 text-[14px] placeholder:text-[#555557] rounded-[10px]'
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div className='justify-center items-center my-[10px] px-[80px]'>
              <button className='px-[30px] py-[10px] hover:bg-[#0b65cc] bg-[#2682ec] rounded-[22px] text-white font-bold font-poppins text-[18px]'
                onClick={uploadToIpfs}>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
