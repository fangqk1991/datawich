########################################
FROM node:19-alpine AS FILES_CACHE

WORKDIR /data/source-files
COPY . .

# /data/meta-files 仅包含 package.json、pnpm-lock.yaml、pnpm-workspace.yaml、.npmrc
RUN mkdir -p /data/meta-files \
    && find . -not -path "*/node_modules/*" -name "package.json" \
      | xargs -i dirname {} \
      | xargs -i sh -c "mkdir -p /data/meta-files/{} && cp {}/package.json /data/meta-files/{}" \
    && cp /data/source-files/pnpm-lock.yaml \
          /data/source-files/.npmrc \
          /data/source-files/pnpm-workspace.yaml \
          /data/meta-files

# 格式化 package.json
RUN node ./deploy/deps/purify-package-json.js /data/meta-files

########################################
# 准备仅包含 package.json 和 yarn.lock 的最小构建依赖文件
# package.json 以外的文件修改将不会影响缓存命中
FROM node:19-alpine AS MODULES_CACHE

ARG BUILD_DIR=/data/build

WORKDIR ${BUILD_DIR}

RUN yarn global add pnpm@8.2.0

COPY --from=FILES_CACHE /data/meta-files/pnpm-lock.yaml ${BUILD_DIR}/pnpm-lock.yaml
RUN pnpm fetch

# 本仓库所有项目共享 pnpm install 缓存
COPY --from=FILES_CACHE /data/meta-files ${BUILD_DIR}
RUN pnpm install -r --offline

# node_modules 已准备完毕；此时复制完整源代码
COPY --from=FILES_CACHE /data/source-files ${BUILD_DIR}

# 将 docker.deps.local/ 目录下的文件复制到 docker.deps/
# docker.deps 中含有上传下载所需的配置文件，故需要在 yarn build 前复制
RUN cp -r ./deploy/docker.deps.local/* ./deploy/docker.deps/

# 下载依赖文件（适用于个别项目）
#RUN npx ali-oss-download ./deploy/docker.deps/web-oss.oss.config.js \
#  auth/something.txt ${BUILD_DIR}/my-modules/something.txt

RUN pnpm build
RUN rm -rf ./node_modules/ && pnpm install -r --offline --prod

########################################
# 最终镜像，仅复制可执行的程序文件和准备必要的系统服务（nginx、curl）
FROM node:19-alpine

# 其他项目若将本语句置于最前方，可共享缓存命中
RUN apk add --no-cache curl openssl nginx>=1.20.1 && yarn global add pm2 && pm2 install pm2-logrotate && mkdir -p /run/nginx/

LABEL maintainer="work@fangqk.com"
WORKDIR /data/datawich

COPY --from=MODULES_CACHE /data/build .
COPY ./deploy/deps/*.sh /data/deps/

COPY ./deploy/datawich/deps/docker.extras.config.js /data/datawich/config/docker.extras.config.js
COPY ./deploy/datawich/deps/datawich.nginx.conf /etc/nginx/http.d/datawich.nginx.conf

# 此步骤会使文件发生改变，应放在后方避免影响缓存命中
ARG commitSHA=Unknown
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' /etc/nginx/http.d/datawich.nginx.conf
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' ./packages/datawich-backend/ecosystem.config.js
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' ./packages/datawich-frontend/dist/index.html
RUN sed -i 's/COMMIT_SHA/'${commitSHA}'/g' ./packages/datawich-frontend-2/dist/index.html
LABEL commitSHA="${commitSHA}"

CMD nginx && /data/deps/on-container-start.sh && pm2-runtime ./packages/datawich-backend/ecosystem.config.js --env ${ENV}
#HEALTHCHECK CMD curl --fail http://localhost:3200/api/health/ping && curl --fail http://localhost:3299/api/health/ping || exit 1
