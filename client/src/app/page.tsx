"use client";
import {Navbar, FileUpload, Welcome, Footbar} from "./components"
import { useActiveAccount } from "thirdweb/react";

export default function Home() {
  const account = useActiveAccount();
  return (
    <main className="bg-[#09163c]">
        <Navbar/>
        {/* <Welcome/> */}
        { account ? (<FileUpload/>) : (<Welcome/>)}
        <Footbar/>
      </main>
  );
}
