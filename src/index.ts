import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { request, GraphQLClient, gql } from 'graphql-request';

dotenv.config();

const app = express();

const port: string | number = process.env.PORT || 5000;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// app.set('view engine', 'ejs');
let access_token = '';

app.get('/', (req, res) => {
  res.send(`<h1>
             <a href="https://github.com/login/oauth/authorize?client_id=${clientID}">Sign In with Github</a>
            </h1>`);
});

app.get('/github/callback', (req: Request, res: Response) => {
  const requestToken = req.query.code;

  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,

    headers: {
      accept: 'application/json',
    },
  }).then((response) => {
    access_token = response.data.access_token;

    console.log(`My token ${access_token}`);
    console.log(`Status ${response.status}`);

    res.redirect('/success');
  });
});

app.get('/success', async (req, res) => {
  const query = gql`
    query($last_num_repos: Int!, $first: Int!) {
      viewer {
        avatarUrl
        repositories(
          affiliations: [OWNER]
          last: $last_num_repos
          isFork: false
        ) {
          nodes {
            name
            createdAt
            updatedAt
            url
            isFork
            primaryLanguage {
              name
            }
            languages(first: 100) {
              nodes {
                name
              }
            }
            defaultBranchRef {
              name
              target {
                ... on Commit {
                  history(first: $first) {
                    nodes {
                      authoredDate
                      committedDate
                      message
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    last_num_repos: 2,
    first: 20,
  };

  try {
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `bearer ${access_token}`,
      },
    });

    const data = await client.request(query, variables);

    console.log(JSON.stringify(data, undefined, 2));
    res.json(data);
  } catch (error) {
    res.send(`Algo paso en la peticion con graphql ${error}`);
  }

  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: `token ${access_token}`,
    },
  }).then((response) => {
    res.send({ userData: response.data });
    // console.log(response.data);
  });
});

app.listen(port, () => console.log(`Hosting @${port}`));
