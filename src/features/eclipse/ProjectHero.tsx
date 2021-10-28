import Card from '../../components/Card'
import Typography from '../../components/Typography'
import Image from '../../components/Image'
import Button from '../../components/Button'
import { formatNumber, formatPercent } from '../../functions'
import { useRouter } from 'next/router'
import { PROJECT_STATUS } from '../../constants/eclipse'

export const ProjectHero = ({ project, totalCommited }) => {
  const router = useRouter()
  const totalCommitedPercent = (totalCommited / project.raise) * 100

  return (
    <div
      className={
        'container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 flex justify-between md:p-6 md:p-0 flex-row mb-5 md:mb-10'
      }
    >
      <div className="md:col-start-1 md:col-end-3 mb-10 md:mb-0">
        <Image
          src={project.logo}
          width="60px"
          height="60px"
          className="rounded-full bg-white"
          layout="fixed"
          alt={project.name}
        />
        <Typography variant="hero" className={'font-bold sm:mt-2 text-white'}>
          {project.name}
        </Typography>
        <a
          href={`https://moonriver.moonscan.io/address/${project.tokenContract}`}
          target="_blank"
          rel="noreferrer"
          className={'-mt-1 text-gray-400'}
        >
          {project.tokenContract}
        </a>
        <div className={'flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-5 mt-5'}>
          <Button
            size="sm"
            className="w-auto"
            variant="filled"
            color="gradient"
            onClick={() => router.push(`${project.id}?tab=join`)}
          >
            Join Pool
          </Button>
          <Button size="sm" variant="outlined" color="gradient" onClick={() => window.open(project.website, '_blank')}>
            View Project Website
          </Button>
        </div>
      </div>
      <Card className="bg-dark-800 rounded-lg md:col-end-6 md:col-span-2">
        <div className="space-y-5">
          <div className="flex flex-col">
            <Typography variant="base">Total Raise</Typography>
            <Typography variant="h3" className="font-bold">
              {formatNumber(project.raise, true, false)}
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography variant="base">
              {project.status == PROJECT_STATUS.UPCOMING
                ? 'Starts On'
                : project.status == PROJECT_STATUS.COMPLETED
                ? 'Ended'
                : 'Live Until'}
            </Typography>
            <Typography variant="h3" className="font-bold">
              {project.status == PROJECT_STATUS.UPCOMING
                ? `Block ${project.startBlock}`
                : project.status == PROJECT_STATUS.COMPLETED
                ? `Block ${project.endBlock}`
                : `Block ${project.endBlock}`}
            </Typography>
            <Typography variant="xs" className="">
              {project.status == PROJECT_STATUS.UPCOMING
                ? `≈ ${project.startsOn}`
                : project.status == PROJECT_STATUS.COMPLETED
                ? `≈ ${project.endsOn}`
                : `≈ ${project.endsOn}`}
            </Typography>
          </div>
          <div className="flex flex-col">
            <div className="relative">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-base inline-block">Total Committed</span>
                </div>
                <div className="text-right">
                  <span className="text-base text-purple">
                    {formatNumber(totalCommited, true, false)} ({formatPercent(totalCommitedPercent)})
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-dark-500">
                <div
                  style={{ width: totalCommitedPercent > 100 ? '100%' : totalCommitedPercent.toFixed(0) + '%' }}
                  className="rounded bg-gradient-to-r from-light-purple  to-purple"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
