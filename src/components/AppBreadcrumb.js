import React from 'react'
import { useLocation } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const location = useLocation()
  const currentHash = location.hash.replace(/^#/, '') || '/'

  const matchPath = (routePath, currentPath) => {
    const routeSegments = routePath.split('/')
    const currentSegments = currentPath.split('/')
    if (routeSegments.length !== currentSegments.length) return false

    return routeSegments.every((seg, i) => seg.startsWith(':') || seg === currentSegments[i])
  }

  const getRouteName = (pathname, routes) => {
    const matchingRoute = routes.find((route) => matchPath(route.path, pathname))
    return matchingRoute ? matchingRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location
      .split('/')
      .filter((x) => x) // Remove empty strings
      .reduce((prev, curr, index, array) => {
        const currentPathname = `${prev}/${curr}`
        const routeName = getRouteName(currentPathname, routes)
        if (routeName) {
          breadcrumbs.push({
            pathname: `#${currentPathname}`, // Include `#` for hash routing
            name: routeName,
            active: index + 1 === array.length,
          })
        }
        return currentPathname
      }, '')
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentHash)
  console.log(breadcrumbs)
  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="#/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
          key={index}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
