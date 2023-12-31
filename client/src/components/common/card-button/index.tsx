import Link from "next/link";
import ButtonSm from "../button/button-sm";
export default function CardButton({ title, desc, url, text, id }: {title: string, desc: string, url?: string, text?: string, id?:string}) {
    return (
        <article id={id} className="max-w-sm min-w-fit p-6 bg-white border text-text-primary border-gray-200 rounded-lg shadow flex flex-col justify-between">
            <div className="p-2">
                <div>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight">{title}</h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{desc}</p>
                </div>
                {url?
                <div className="mt-auto">
                    <ButtonSm text={text? text : "Learn more"} url={url}></ButtonSm>
                </div> 
                : null 
                }
            </div>
        </article>
    )
}