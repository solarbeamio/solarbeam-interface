import React from 'react'
import Card from '../../components/Card'
import Typography from '../../components/Typography'
import Image from '../../components/Image'

export const AboutProjectTab = ({ project }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 space-y-10 md:space-y-0 md:space-x-10">
        <div className="grid grid-cols-1 space-y-4 items-center">
          <div className="flex flex-col">
            <Typography variant="h1" className="font-bold">
              Highlights
            </Typography>
            <ul className="mt-2 list-inside list-disc space-y-1 text-lg font-regular">
              {project.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="hidden md:grid grid-cols-1 space-y-4  justify-items-end">
          <div className="flex flex-col">
            <Image alt={''} width={500} height={393} className={'rounded'} src={project.image} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 mt-10">
        <div className="grid grid-cols-1 space-y-4">
          <div className="flex flex-col">
            <Typography variant="h1" className="font-bold">
              Product
            </Typography>
            <Typography variant="lg" className="">
              {project.description}
            </Typography>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-10 mt-10">
          <Card
            className="border py-2 px-4"
            removePadding
            header={
              <Typography variant="lg" className="mb-2 font-bold">
                Socials
              </Typography>
            }
          >
            {project.socials.map((p, i) => (
              <div
                key={i}
                className="grid justify-center py-1 grid-cols-2 border border-t-0 border-r-0 border-l-0 border-thin border-dark-600"
              >
                <div>{p.title}</div>
                <a className="col-span-2" href={p.link} target="_blank" rel="noreferrer">
                  {p.link}
                </a>
              </div>
            ))}
          </Card>
          <Card
            className="border py-2 px-4"
            removePadding
            header={
              <Typography variant="lg" className="mb-2 font-bold">
                Tokenomics
              </Typography>
            }
          >
            {project.tokenomics.map((p, i) => (
              <div
                key={i}
                className="grid  justify-center py-1 grid-cols-2 border border-t-0 border-r-0 border-l-0 border-thin border-dark-600"
              >
                <div>{p.title}</div>
                <div>{p.description}</div>
              </div>
            ))}
          </Card>
          <Card
            className="border py-2 px-4"
            removePadding
            header={
              <Typography variant="lg" className="mb-2 font-bold">
                Eclipse Details
              </Typography>
            }
          >
            {project.ido.map((p, i) => (
              <div
                key={i}
                className="grid  justify-center py-1 grid-cols-2 border border-t-0 border-r-0 border-l-0 border-thin border-dark-600"
              >
                <div>{p.title}</div>
                <div>{p.description}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
