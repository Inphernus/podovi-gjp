// Izvor: 21st.dev — Link Hover (@Shatlyk1011, autor @codegrid, MIT), preuzeto 2026-10-22
// https://21st.dev/@Shatlyk1011/components/link-hover
// Original, neprilagođen. NIJE efekt za linkove u navigaciji: velika lista poveznica (text-5xl) uz nagnutu
// fotografiju koja pri hoveru uleti (GSAP: top 125%→0, left -50%→0, rotate -30°→0, 1.25 s power3.out).
// Ovisi o gsap i @gsap/react. Još nije ugrađen — čeka odluku gdje ga koristiti.
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const DefaultImg = 'https://cdn.21st.dev/assets/mirror/5b/5be45cb0743395e662db5af2c15dea34866bfc17b9be78f6a44910c56947398a.jpg'

type Item = { imgUrl: string; title: string }

export default function ImageHover({ items }: { items: Item[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const newImgRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return
      const previewContainer = previewContainerRef.current
      const menuLinkItems = sectionRef.current.querySelectorAll('.menu-link-item')
      let lastHoveredIndex: number | null = null

      const handleMouseOver = (index: number) => {
        if (index !== lastHoveredIndex) {
          const imgContainer = document.createElement('div')
          imgContainer.classList.add('temp-image', 'absolute', 'rotate-[-30deg]', '-left-1/2', 'top-[125%]')
          const img = document.createElement('img')
          img.src = items[index].imgUrl
          img.alt = ''
          img.classList.add('w-full', 'h-full', 'object-fill')
          imgContainer.appendChild(img)
          previewContainer!.appendChild(imgContainer)

          gsap.to(imgContainer, {
            top: '0%',
            left: '0%',
            rotate: 0,
            duration: 1.25,
            ease: 'power3.out',
            // clean up dom function
            onComplete: () => {
              gsap.delayedCall(2, () => {
                const allImgContainers = previewContainer!.querySelectorAll('.temp-image')
                if (allImgContainers.length > 1) {
                  Array.from(allImgContainers)
                    .slice(0, -1)
                    .forEach((container) => {
                      setTimeout(() => {
                        container.remove()
                      }, 2000)
                    })
                }
              })
            },
          })

          lastHoveredIndex = index
        }
      }

      menuLinkItems.forEach((item, index) => {
        item.addEventListener('mouseover', () => handleMouseOver(index))
      })
    },
    { scope: sectionRef, dependencies: [sectionRef] }
  )

  return (
    <section ref={sectionRef} className='flex h-full w-full items-center gap-16 p-20 max-md:p-5'>
      <div className='flex-1'>
        <ul className='text-muted-foreground [&>li:hover]:text-foreground flex flex-1 flex-col gap-6 text-5xl font-medium max-md:gap-2 max-md:text-3xl [&>li]:transition'>
          {items.map(({ title }) => (
            <li key={title} className='menu-link-item'>
              {title}
            </li>
          ))}
        </ul>
      </div>
      <div
        ref={previewContainerRef}
        className='left-1/2 max-w-90 min-w-48 flex-2 rotate-15 [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)] max-md:max-w-64'
      >
        <img src={DefaultImg} className='h-full w-full object-fill' alt='' />
        <div ref={newImgRef} className='absolute top-[125%] -left-1/2 h-full w-full rotate-[-30deg]'>
          <img src={items[1].imgUrl} className='h-full w-full object-fill' alt='' />
        </div>
      </div>
    </section>
  )
}
