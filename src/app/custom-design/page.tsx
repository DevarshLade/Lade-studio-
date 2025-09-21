"use client";

import React from "react";
import { CustomDesignForm } from "@/components/custom-design/CustomDesignForm";

export default function CustomDesignPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <section className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">Custom Designs</h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        Have a unique vision? Let's bring it to life together.
                    </p>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        Fill out the form below to start a conversation about your custom artwork. 
                        Please be as detailed as possible. We will get back to you to discuss 
                        the details, timeline, and pricing.
                    </p>
                </section>

                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    <CustomDesignForm />
                </div>
            </div>
        </div>
    );
}
